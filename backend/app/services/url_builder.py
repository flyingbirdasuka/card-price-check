from urllib.parse import quote_plus


def build_urls(card_type: str, card_name: str, card_number: str = "") -> dict:
    query = f"{card_name} {card_number}".strip()
    q = quote_plus(query)
    name_q = quote_plus(card_name)

    pricecharting = f"https://www.pricecharting.com/search-products?q={q}&type=price-guide"

    if card_type == "pokemon":
        cardmarket = f"https://www.cardmarket.com/en/Pokemon/Products/Search?searchString={name_q}"
        ebay = f"https://www.ebay.com/sch/i.html?_nkw={q}+japanese&LH_Sold=1&LH_Complete=1"
    else:
        cardmarket = f"https://www.cardmarket.com/en/YuGiOh/Products/Search?searchString={name_q}"
        ebay = f"https://www.ebay.com/sch/i.html?_nkw={q}+yugioh+japanese&LH_Sold=1&LH_Complete=1"

    return {"pricecharting": pricecharting, "cardmarket": cardmarket, "ebay": ebay}
