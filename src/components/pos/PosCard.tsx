"use client";
import React, { useState } from "react";
import Image from "next/image";
import FoodImage from "@public/banana.jpg";
import {
  Modal,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type PosCardProps = {
  productName: string;
  productImage: string;
  productPrice: number | string;
  productQuantity: number;

  uiChange: number;
  setUiChange: React.Dispatch<React.SetStateAction<number>>;
   uiChnageForPos: number;
  setUiChnageForPos: React.Dispatch<React.SetStateAction<number>>;
  stocks: Array<{
    id: number;
    quantity: number;
    pos_price: number;
    variation_stocks: Array<{
      variation_option: {
        id: number;
        name: string;
      };
    }>;
  }>;
};

export default function PosCard({
  productName,
  productImage,
  productPrice,
  productQuantity,
  uiChnageForPos,
  setUiChnageForPos,


  stocks,
  uiChange,
  setUiChange,
}: PosCardProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    if (stocks.length > 1) {
      setOpen(true);
    } else {
      // If only one stock, add it directly to the cart
      addToCart(stocks[0].id, 1);
    }
  };

  const handleClose = () => setOpen(false);

  const playSound = () => {
    const audio = new Audio("/add-to-cart.mp3"); // Replace with your sound file name
    audio.play();
  };

  const addToCart = (stockId: number, quantity: number) => {
    if (typeof window !== "undefined") {
      //console.log("ProductImage", productImage);
      console.log("uiChange", uiChange);
      const cartItems = JSON.parse(localStorage.getItem("cart_items") || "[]");
      type CartItem = { stock_id: number; quantity: number };
      const existingItemIndex = cartItems.findIndex(
        (item: CartItem) => item.stock_id === stockId
      );

      if (existingItemIndex !== -1) {
        // Update quantity if item already exists
        cartItems[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to the cart
        cartItems.push({ stock_id: stockId, quantity });
      }

      localStorage.setItem("cart_items", JSON.stringify(cartItems));
      console.log("Cart Items:", cartItems); // Log for testing

      // Play sound after adding to cart
      playSound();
      setUiChange((prev: number) => prev + 1); // Trigger UI change
        setUiChnageForPos((prev) => prev + 1); // Trigger UI change

    }
  };

  return (
    <>
      <div
        className="bg-white cursor-pointer hover:scale-105 duration-75 py-5 px-7 shadow-lg rounded-[10px] relative min-w-[175px] max-w-[175px] flex flex-col justify-between"
        onClick={handleOpen}
      >
        <div className="absolute top-2 right-2 bg-secondary text-white text-[8px] px-2 py-1 rounded-full">
          {productQuantity} Pcs
        </div>
        <div className="flex flex-col gap-3">
          <img
            src={`${process.env.NEXT_PUBLIC_IMAGE_BASE || ""}${productImage}`}
            width={90}
            height={90}
            alt="pos-image"
            className="object-cover w-[90px] h-[90px]"
          ></img>
          <div className="flex flex-col">
            <span className="font-medium text-[14px]">{productName}</span>
          </div>
        </div>
        <button className="bg-primary mt-3 max-w-[80px] rounded-[5px] text-[10px] text-white">
          ¥{productPrice}
        </button>
      </div>

      {/* Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 450,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: "10px",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          {/* Modal Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" component="h2">
              Stock Variations
            </Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Stock Variations List */}
          <List>
            {stocks
              .filter((stock, index, self) => {
                const variationOptionId =
                  stock.variation_stocks[0]?.variation_option?.id;
                return (
                  variationOptionId &&
                  self.findIndex(
                    (s) =>
                      s.variation_stocks[0]?.variation_option?.id ===
                      variationOptionId
                  ) === index
                );
              })
              .reverse() // Reverse the array to keep the last occurrence
              .map((stock, index) => (
                <ListItem
                  key={index}
                  sx={{
                    borderBottom: "1px solid #ddd",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1,
                  }}
                >
                  <ListItemText
                    primary={`Variation: ${
                      stock.variation_stocks[0]?.variation_option?.name || "N/A"
                    }`}
                    secondary={`Price: ¥${stock.pos_price}`}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => {
                      addToCart(stock.id, 1);
                      handleClose();
                    }}
                  >
                    Add
                  </Button>
                </ListItem>
              ))}
          </List>
        </Box>
      </Modal>
    </>
  );
}
