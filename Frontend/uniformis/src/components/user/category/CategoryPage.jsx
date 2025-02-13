import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchProducts } from '../../../redux/product/userProductSlice';
import ProductCard from '../productCard/ProductCard';
import { Loader2 } from "lucide-react";

const CategoryPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { products, categories, loading, error } = useSelector((state) => state.userProducts);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resultAction = await dispatch(fetchProducts()).unwrap();
      } catch (err) {
        toast.error(err || 'Failed to load products');
      }
    };

    fetchData();
  }, [dispatch]);

  // Correctly filter products by comparing category.id
  const categoryProducts = products?.filter(product => product?.category?.id === parseInt(id)) || [];

  // Find category name
  const categoryName = categories?.find(cat => cat?.id === parseInt(id))?.name || 'Category Products';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">{categoryName}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categoryProducts.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No products found in this category.
          </div>
        ) : (
          categoryProducts.map((product) => (
            <Link
              key={product.id}
              to={`/user/product/${product.id}`}
              className="transition-transform duration-300 hover:scale-105"
            >
              <ProductCard product={product} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryPage;