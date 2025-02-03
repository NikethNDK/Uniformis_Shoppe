import React, { useState, useEffect } from "react";
import { productApi } from "../../../adminaxiosconfig";
import { Form, Button, Card } from "react-bootstrap";
import { Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ProductList.css";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productApi.get("/items/");
      setProducts(response.data);
      if (!isFetched) {
        toast.success("Products loaded successfully!");
        setIsFetched(true);
      }
    } catch (error) {
      toast.error("Error fetching products.");
      console.error("Error fetching products:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary">Products</h1>
          <div className="flex gap-4">
            <Form.Control
              type="search"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control-custom"
            />
            <Button variant="primary" className="add-product-button">
              <Link
                to="/admin/products/add"
                className="text-white text-decoration-none"
              >
                Add New Product
              </Link>
            </Button>
          </div>
        </div>
        <Card className="shadow-sm">
          <Card.Body className="p-0">
            <table className="table table-hover">
              <thead className="thead-dark">
                <tr>
                  <th>Image</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>View</th>
                  <th>Size</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <img 
                        src={`${product.images[0].image}`}
                        alt={product.name}
                        className="img-thumbnail product-image product-img"
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>₹{product.price}</td>
                    <td>{product.stock_quantity}</td>
                    <td>
                      <Button variant="outline-secondary" size="sm">
                        Review
                      </Button>
                    </td>
                    <td>
                      <Button variant="outline-secondary" size="sm">
                        Size
                      </Button>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button variant="light" size="sm">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default ProductList;
