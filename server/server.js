import express from "express"
import dotenv from "dotenv"
import { connectDB } from "./config/db.js"

import Product from "./models/product.model.js"
import mongoose from "mongoose"

dotenv.config()

const app = express()

// middlewares
app.use(express.json()) // allow to accept JSON data in the req.body

app.get("/api/products", async (req, res) => {
	try {
		const products = await Product.find({})
		res.status(200).json({ success: true, data: products })
	} catch (error) {
		console.error("Error getting products", error?.message)
		res.status(500).json({
			message: "server error",
			error: error?.message,
			success: false,
		})
	}
})

app.post("/api/products", async (req, res) => {
	const product = req.body

	if (!product.name || !product.image || !product.price) {
		return res
			.status(400)
			.json({ message: "All fields are required", success: false })
	}

	const newProduct = new Product({
		name: product.name,
		price: product.price,
		image: product.image,
	})

	try {
		await newProduct.save()
		res.status(201).json({ success: true, data: newProduct })
	} catch (error) {
		console.error("Error creating product", error?.message)
		res.status(500).json({
			message: "server error",
			error: error?.message,
			success: false,
		})
	}
})

app.put("/api/products/:id", async (req, res) => {
	const { id } = req.params

	try {
		const product = req.body

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res
				.status(404)
				.json({ success: false, message: "Invalid product id" })
		}

		const updatedProduct = await Product.findByIdAndUpdate(id, product, {
			new: true,
		})
		res.status(200).json({ success: true, data: updatedProduct })
	} catch (error) {
		console.error("Error updating product", error?.message)
		res.status(500).json({
			message: "server error",
			error: error?.message,
			success: false,
		})
	}
})

app.delete("/api/products/:id", async (req, res) => {
	const { id } = req.params

	try {
		const deletedProduct = await Product.findByIdAndDelete(id)

		if (!deletedProduct) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			})
		}

		res.status(200).json({
			success: true,
			message: "Product deleted successfully",
		})
	} catch (error) {
		console.error("Error deleting product", error?.message)
		res.status(500).json({
			success: false,
			message: "server error",
			error: error.message,
		})
	}
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
	connectDB()
	console.log(`Server is running on http://localhost:5000`)
})
