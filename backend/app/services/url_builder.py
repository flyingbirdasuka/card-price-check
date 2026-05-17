from urllib.parse import quote_plus


def build_urls(card_type: str, card_name: str, card_number: str = "") -> dict:
    full_query = f"{card_name} {card_number}".strip()
    name_q = quote_plus(card_name)
    full_q = quote_plus(full_query)

    # PriceCharting search works better with name only — card numbers like "DL2-135"
    # are set codes that confuse the search. User picks the right set from results.
    japanese_q = quote_plus(f"{card_name} japanese")
    pricecharting = f"https://www.pricecharting.com/search-products?q={japanese_q}&type=price-guide"

    if card_type == "pokemon":
        cardmarket = f"https://www.cardmarket.com/en/Pokemon/Products/Search?searchString={name_q}"
        ebay = f"https://www.ebay.com/sch/i.html?_nkw={full_q}+japanese&LH_Sold=1&LH_Complete=1"
    else:
        cardmarket = f"https://www.cardmarket.com/en/YuGiOh/Products/Search?searchString={name_q}"
        ebay = f"https://www.ebay.com/sch/i.html?_nkw={full_q}+yugioh+japanese&LH_Sold=1&LH_Complete=1"

    return {"pricecharting": pricecharting, "cardmarket": cardmarket, "ebay": ebay}
