import base64
import json
import anthropic
from ..config import settings

client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)


async def scan_card_photo(image_data: bytes, mime_type: str) -> dict:
    image_b64 = base64.standard_b64encode(image_data).decode("utf-8")

    message = await client.messages.create(
        model="claude-opus-4-5",
        max_tokens=300,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {"type": "base64", "media_type": mime_type, "data": image_b64},
                },
                {
                    "type": "text",
                    "text": (
                        "Look at this trading card and extract:\n"
                        "1. card_type: 'pokemon' or 'yugioh'\n"
                        "2. card_name: English name if visible, otherwise romanize the Japanese\n"
                        "3. card_number: e.g. '4/102' or 'DUSA-EN001' (empty string if not visible)\n\n"
                        "Respond ONLY with valid JSON: "
                        '{"card_type": "...", "card_name": "...", "card_number": "..."}'
                    ),
                },
            ],
        }],
    )

    text = message.content[0].text.strip()
    start, end = text.find("{"), text.rfind("}") + 1
    return json.loads(text[start:end])


async def suggest_vinted_price(
    card_name: str,
    card_type: str,
    card_number: str,
    my_price: float,
    condition: str,
) -> dict:
    message = await client.messages.create(
        model="claude-opus-4-5",
        max_tokens=400,
        messages=[{
            "role": "user",
            "content": (
                f"I'm selling a trading card on Vinted in the Netherlands.\n\n"
                f"Card: {card_name} ({card_type.upper()}) #{card_number}\n"
                f"Market price I found: €{my_price:.2f}\n"
                f"Condition: {condition}\n\n"
                "Give me a suggested listing price for Vinted Netherlands, considering:\n"
                "- Vinted buyers expect a small discount vs market\n"
                "- Japanese cards are niche but have collectors in EU\n"
                "- NL domestic shipping is typically €3–4\n"
                "- Condition matters a lot for TCG cards\n\n"
                "Respond ONLY with valid JSON:\n"
                '{"suggested_price": <number>, "price_range": {"low": <number>, "high": <number>}, '
                '"reasoning": "<2-3 sentences>"}'
            ),
        }],
    )

    text = message.content[0].text.strip()
    start, end = text.find("{"), text.rfind("}") + 1
    return json.loads(text[start:end])
