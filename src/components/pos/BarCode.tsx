"use client";
import { useState, useRef, useEffect } from "react";
import { Product } from "@/types/type";

interface BarCodeProps {
  product: Product[];
  setUiChange: React.Dispatch<React.SetStateAction<number>>;
  uiChange: number;
  uiChnageForPos: number;
  setUiChnageForPos: React.Dispatch<React.SetStateAction<number>>;
}

interface CartItem {
  stockId: number;
  quantity: number;

}

export default function BarCode({ product, setUiChange,uiChange,uiChnageForPos,setUiChnageForPos }: BarCodeProps) {
  const [input, setInput] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // // Focus the input whenever cartItems or uiChange changes
  // useEffect(() => {
  //   inputRef.current?.focus();
  // }, [cartItems]);

  //Optionally, if you want to focus on every uiChange (from parent):
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 2500);
    return () => clearTimeout(timer);
  }, [uiChnageForPos]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    // Fetch suggestions if input is not empty
    if (value.trim() !== "") {
      const filteredSuggestions = product.filter((p) =>
        p.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim() !== "") {
      const foundProduct = product.find((p) =>
        p.stocks?.some((stock) => stock.barcode === input)
      );

      if (foundProduct) {
        // Handle barcode input
        addToCart(foundProduct, input);
      } else {
        // Handle product name input
        const matchedProduct = product.find(
          (p) => p.name.toLowerCase() === input.toLowerCase()
        );

        if (matchedProduct) {
          addToCart(matchedProduct);
        } else {
          console.error("No matching product found.");
        }
      }

      setInput(""); // Clear the input field
      setSuggestions([]); // Clear suggestions
    }
  };

  const handleSuggestionClick = (selectedProduct: Product) => {
    addToCart(selectedProduct);
    setInput(""); // Clear the input field
    setSuggestions([]); // Clear suggestions
  };

  const addToCart = (selectedProduct: Product, barcode?: string) => {
    const stock = barcode
      ? selectedProduct.stocks?.find((s) => s.barcode === barcode)
      : selectedProduct.stocks?.[0]; // Use the first stock if no barcode is provided

    if (stock) {
      setCartItems((prevCartItems) => {
        const existingItemIndex = prevCartItems.findIndex(
          (item) => item.stockId === stock.id
        );

        let updatedCartItems;

        if (existingItemIndex !== -1) {
          // Update quantity if item already exists
          updatedCartItems = [...prevCartItems];
          updatedCartItems[existingItemIndex].quantity += 1;
        } else {
          // Add new item to the cart
          updatedCartItems = [
            ...prevCartItems,
            { stockId: stock.id, quantity: 1 },
          ];
        }

        // Save to localStorage
        if (typeof window !== "undefined") {
          const cartItemsFromStorage = JSON.parse(
            localStorage.getItem("cart_items") || "[]"
          );

          const storageItemIndex = cartItemsFromStorage.findIndex(
            (item: { stock_id: number }) => item.stock_id === stock.id
          );

          if (storageItemIndex !== -1) {
            cartItemsFromStorage[storageItemIndex].quantity = 1;
          } else {
            cartItemsFromStorage.push({ stock_id: stock.id, quantity: 1 });
          }

          localStorage.setItem(
            "cart_items",
            JSON.stringify(cartItemsFromStorage)
          );
        }

        return updatedCartItems;
      });

      setUiChange((prev) => prev + 1); // Trigger UI change
    } else {
      console.error("Stock not found for the selected product.");
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleInputSubmit}
        className="w-full h-[50px] border-0 bg-gray-200 pl-10 rounded-[10px]"
        placeholder="Scan Barcode or Search Product"
        autoFocus
      />
      {suggestions.length > 0 && (
        <ul className="absolute top-[50px] left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}