"use client";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CloseIcon from "@mui/icons-material/Close";
import { useState, useEffect, useRef } from "react";
import PaySection from "./PaySection";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { Box, Fab } from "@mui/material";

type GuestCartItem = {
  action: string;
  id: number;
  quantity: number;
  stock_id: number;
};

type CartItemType = {
  id: number;
  stock: {
    id: number;
    product: { name: string; type: string };
    pos_price: number;
    pos_discount: number;
  };
  quantity: number;
};

export default function PosTable({
  uiChange,
  setUiChange,
  uiChnageForPos,
  setUiChnageForPos,
}: {
  uiChange: number;
  setUiChange: React.Dispatch<React.SetStateAction<number>>;
  uiChnageForPos: number;
  setUiChnageForPos: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [cartData, setCartData] = useState<CartItemType[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalAmountWithTax, setTotalAmountWithTax] = useState(0);
  const [localQuantities, setLocalQuantities] = useState<
    Record<number, number>
  >({});
  const debounceTimers = useRef<Record<number, NodeJS.Timeout>>({});

  const [totalDiscountForAllProduct, setTotalDiscountForAllProduct] =
    useState(0);
  const [localDiscounts, setLocalDiscounts] = useState<Record<number, number>>(
    {}
  );

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const scrollTable = (direction: "up" | "down") => {
    const container = tableContainerRef.current;
    if (container) {
      const scrollAmount = 80; // px per click
      container.scrollBy({
        top: direction === "up" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Update total discount whenever localDiscounts change
  useEffect(() => {
    const totalDiscount = Object.values(localDiscounts).reduce(
      (sum, discount) => sum + discount,
      0
    );
    setTotalDiscountForAllProduct(totalDiscount);
    localStorage.setItem(
      "totalDiscountForAllProduct",
      totalDiscount.toString()
    );
    console.log("Total Discount for All Products:", totalDiscount);
  }, [localDiscounts]);

  useEffect(() => {
    fetchGuestCart();
  }, [uiChange]);

  const fetchGuestCart = async () => {
    try {
      let localCart = [];

      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("cart_items");
        localCart = stored ? JSON.parse(stored) : [];
      }

      if (!Array.isArray(localCart) || localCart.length === 0) {
        setCartData([]);
        setTotalAmount(0);
        setTotalAmountWithTax(0);
        return;
      }

      const queryParams = new URLSearchParams();
      localCart.forEach((item: GuestCartItem, index: number) => {
        queryParams.append(`guest_cart[${index}][action]`, "add");
        queryParams.append(`guest_cart[${index}][id]`, index.toString());
        queryParams.append(
          `guest_cart[${index}][quantity]`,
          (item.quantity ?? 0).toString()
        );
        queryParams.append(
          `guest_cart[${index}][stock_id]`,
          item.stock_id.toString()
        );
      });

      queryParams.append("type", "pos");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/pos-guest_carts?${queryParams}`
      );
      const result = await response.json();

      //response is not ok
      if (!response.ok) {
        console.error("Failed to fetch guest cart:", result);
        localStorage.removeItem("cart_items");
        setCartData([]);
        return;
      }

      if (result.status === "success") {
        const sortedCartItems = result.data.cart_items.sort(
          (a: CartItemType, b: CartItemType) => b.id - a.id
        );
        setCartData(sortedCartItems);

        //setCartData(sortedCartItems);
        setTotalAmount(parseFloat(result.data.total_amount));
        setTotalAmountWithTax(parseFloat(result.data.total_amount_with_tax));

        //customer screeen

        const sendTotalToLocalhost = (label: string, value: number) => {
          fetch(`http://localhost:3000/${label}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ value }),
          })
            .then((res) => res.text())
            .then((text) => {
              // Optionally handle response, e.g., show a toast or log
              console.log("Localhost response:", text);
            })
            .catch((err) => {
              console.error("Error sending to localhost:", err.message);
            });
        };

        // Send last added item's price to customer screen
        if (result.data.cart_items && result.data.cart_items.length > 0) {
          // Find the item that was most recently added (not just updated)
          // We'll assume the last item in the array is the newly added one
          const lastItem =
            result.data.cart_items[result.data.cart_items.length - 1];
          const price =
            Number(lastItem?.stock?.pos_price || 0) -
            Number(lastItem?.stock?.pos_discount || 0);
          sendTotalToLocalhost("price", price);

          //wait 500ms second
          setTimeout(() => {
            // Use the value from the API response, not the state
            setTimeout(() => {
              sendTotalToLocalhost(
                "total",
                parseFloat(result.data.total_amount_with_tax)
              );
            }, 500);
          }, 500);
        }

        // Initialize local quantities
        const quantities: Record<number, number> = {};
        result.data.cart_items.forEach((item: CartItemType) => {
          quantities[item.stock.id] = item.quantity;
        });
        setLocalQuantities(quantities);
      }
    } catch (error) {
      console.error("Error fetching guest cart:", error);
    }
  };

  const updateGuestCart = async (stockId: number, quantity: number) => {
    if (isNaN(quantity)) return;

    try {
      let localCart = [];

      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("cart_items");
        localCart = stored ? JSON.parse(stored) : [];
      }

      const stockItemIndex = localCart.findIndex(
        (item: GuestCartItem) => item.stock_id === stockId
      );

      if (stockItemIndex === -1) return;

      localCart[stockItemIndex].quantity = quantity;
      localStorage.setItem("cart_items", JSON.stringify(localCart));

      await fetchGuestCart();
      setUiChnageForPos((prev) => prev + 1); // Trigger UI change
    } catch (error) {
      console.error("Error updating guest cart:", error);
    }
  };

  const debounceUpdate = (stockId: number, quantity: number) => {
    clearTimeout(debounceTimers.current[stockId]);

    debounceTimers.current[stockId] = setTimeout(() => {
      updateGuestCart(stockId, quantity);
    }, 500);
  };

  const removeProductFromCart = (stockId: number) => {
    try {
      let localCart = [];

      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("cart_items");
        localCart = stored ? JSON.parse(stored) : [];
      }

      const updatedCart = localCart.filter(
        (item: GuestCartItem) => item.stock_id !== stockId
      );

      localStorage.setItem("cart_items", JSON.stringify(updatedCart));
      fetchGuestCart();
    } catch (error) {
      console.error("Error removing product from cart:", error);
    }
  };

  return (
    <div>
      <Box sx={{ position: "relative" }}>
        <Fab
          size="small"
          color="primary"
          aria-label="scroll up"
          onClick={() => scrollTable("up")}
          sx={{
            position: "absolute",
            top: 8,
            right: -16,
            zIndex: 10,
            opacity: 0.85,
          }}
        >
          <ArrowUpwardIcon />
        </Fab>
        <Fab
          size="small"
          color="primary"
          aria-label="scroll down"
          onClick={() => scrollTable("down")}
          sx={{
            position: "absolute",
            bottom: 8,
            right: -16,
            zIndex: 10,
            opacity: 0.85,
          }}
        >
          <ArrowDownwardIcon />
        </Fab>
        <TableContainer
          component={Paper}
          ref={tableContainerRef}
          sx={{
            maxHeight: 300, // Set your desired max height (e.g., 400px)
            overflowY: "auto",
          }}
        >
          <Table sx={{ minWidth: 400 }} aria-label="simple table" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <b>Product</b>
                </TableCell>
                <TableCell align="left">
                  <b>Price</b>
                </TableCell>
                <TableCell align="left">
                  <b>QTY</b>
                </TableCell>
                <TableCell align="left">
                  <b>Total</b>
                </TableCell>
                <TableCell align="left">
                  <b>Discount</b>
                </TableCell>{" "}
                {/* New Discount Column */}
                <TableCell align="center">
                  <b>Action</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cartData.map((item, index) => {
                const price = Number(item?.stock?.pos_price || 0);
                const discount = Number(item?.stock?.pos_discount || 0);
                const unitPrice = price - discount;
                const stockId = item.stock.id;
                const quantity = localQuantities[stockId] || item.quantity;
                const productDiscount = localDiscounts[stockId] || 0;
                const type = item.stock.product.type;

                return (
                  <TableRow key={index}>
                    <TableCell>{item.stock.product.name}</TableCell>
                    <TableCell align="left">{unitPrice}</TableCell>

                    <TableCell align="left">
                      <div className="flex items-center gap-2">
                        {type === "fixed" ? (
                          <>
                            <input
                              type="number"
                              min={0}
                              placeholder="Kg"
                              value={Math.floor(quantity)}
                              onChange={(e) => {
                                const kg = Number(e.target.value) || 0;
                                const gram = Math.round(
                                  (quantity - Math.floor(quantity)) * 1000
                                );
                                const totalKg = kg + gram / 1000;
                                setLocalQuantities((prev) => ({
                                  ...prev,
                                  [stockId]: totalKg,
                                }));
                                debounceUpdate(stockId, totalKg);
                              }}
                              style={{
                                width: "40px",
                                textAlign: "center",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                padding: "4px",
                              }}
                            />
                            <span>kg</span>
                            <input
                              type="number"
                              min={0}
                              max={999}
                              placeholder="g"
                              value={Math.round(
                                (quantity - Math.floor(quantity)) * 1000
                              )}
                              onChange={(e) => {
                                let gram = Number(e.target.value) || 0;
                                if (gram > 999) gram = 999;
                                const kg = Math.floor(quantity);
                                const totalKg = kg + gram / 1000;
                                setLocalQuantities((prev) => ({
                                  ...prev,
                                  [stockId]: totalKg,
                                }));
                                debounceUpdate(stockId, totalKg);
                              }}
                              style={{
                                width: "70px",
                                textAlign: "center",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                padding: "4px",
                              }}
                            />
                            <span>g</span>
                          </>
                        ) : (
                          <>
                            <IconButton
                              onClick={() => {
                                const newQty = Math.max(quantity - 1, 1);
                                setLocalQuantities((prev) => ({
                                  ...prev,
                                  [stockId]: newQty,
                                }));
                                debounceUpdate(stockId, newQty);
                              }}
                              sx={{
                                backgroundColor: "#53B175",
                                color: "white",
                                borderRadius: "50%",
                                padding: "8px",

                                "&:hover": { backgroundColor: "#53B175" },
                              }}
                            >
                              <RemoveIcon fontSize="medium" />
                            </IconButton>

                            <input
                              type="number"
                              value={quantity === 0 ? "" : quantity}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "") {
                                  setLocalQuantities((prev) => {
                                    const updated = { ...prev };
                                    delete updated[stockId];
                                    return updated;
                                  });
                                  return;
                                }
                                const num = parseFloat(val);
                                if (!isNaN(num)) {
                                  setLocalQuantities((prev) => ({
                                    ...prev,
                                    [stockId]: num,
                                  }));
                                  debounceUpdate(stockId, num);
                                }
                              }}
                              style={{
                                width: "70px",

                                textAlign: "center",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                padding: "4px",
                              }}
                            />

                            <IconButton
                              onClick={() => {
                                const newQty = Math.max(
                                  Number(quantity) + 1,
                                  1
                                );
                                setLocalQuantities((prev) => ({
                                  ...prev,
                                  [stockId]: newQty,
                                }));
                                debounceUpdate(stockId, newQty);
                              }}
                              sx={{
                                backgroundColor: "#53B175",
                                color: "white",
                                borderRadius: "50%",
                                padding: "8px",
                                "&:hover": { backgroundColor: "#53B175" },
                              }}
                            >
                              <AddIcon fontSize="medium" />
                            </IconButton>
                          </>
                        )}
                      </div>
                    </TableCell>

                    <TableCell align="left">
                      {" "}
                      {(unitPrice * quantity).toFixed(2)}
                    </TableCell>
                    <TableCell align="left">
                      <input
                        type="number"
                        value={productDiscount}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value));
                          setLocalDiscounts((prev) => ({
                            ...prev,
                            [stockId]: val,
                          }));
                        }}
                        style={{
                          width: "50px",
                          textAlign: "center",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          padding: "4px",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => removeProductFromCart(stockId)}
                        sx={{
                          color: "red",
                          "&:hover": { color: "darkred" },
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <PaySection
        total={totalAmountWithTax}
        setUiChange={setUiChange}
        setLocalDiscounts={setLocalDiscounts}
        uiChnageForPos={uiChnageForPos}
        setUiChnageForPos={setUiChnageForPos}
      />
    </div>
  );
}
