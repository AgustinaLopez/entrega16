import { productsService } from "../repositories/index.js";

export const getProducts = async (req, res) => {
    try {
      const products = await productsService.getProducts();
      res.json({ status: "success", payload: products });
    } catch (error) {
      console.log(error);
      res.json({ result: "error", error });
    }
  };