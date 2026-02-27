import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SellerDashboard = () => {
    const { role } = useContext(AuthContext);
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stockQuantity: ''
    });

    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        if (role !== 'Seller' && role !== 'Admin') {
            navigate('/products');
        } else {
            fetchSellerProducts();
        }
    }, [role, navigate]);

    const fetchSellerProducts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/products/seller/me');
            setProducts(data.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching seller products', err);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddOrUpdateProduct = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Update
                await api.put(`/products/${editingId}`, formData);
                alert('Product updated successfully!');
            } else {
                // Add
                await api.post('/products', formData);
                alert('Product added successfully!');
            }

            // Reset form
            setFormData({ name: '', description: '', price: '', category: '', stockQuantity: '' });
            setEditingId(null);

            // Refresh list
            fetchSellerProducts();
        } catch (err) {
            console.error(err.response?.data?.message || 'Error saving product');
            alert('Failed to save product');
        }
    };

    const handleEdit = (product) => {
        setEditingId(product._id);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            stockQuantity: product.stockQuantity
        });
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        try {
            await api.delete(`/products/${productId}`);
            alert('Product deleted successfully');
            fetchSellerProducts();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete product');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '50px auto', padding: '0 20px' }}>
            <h2>Seller Dashboard</h2>

            <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '8px', marginBottom: '40px' }}>
                <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                <form onSubmit={handleAddOrUpdateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input name="name" type="text" placeholder="Product Name" value={formData.name} onChange={handleChange} required />
                    <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
                    <input name="price" type="number" placeholder="Price" value={formData.price} onChange={handleChange} required />
                    <input name="category" type="text" placeholder="Category" value={formData.category} onChange={handleChange} required />
                    <input name="stockQuantity" type="number" placeholder="Stock Quantity" value={formData.stockQuantity} onChange={handleChange} required />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{ flex: 1 }}>{editingId ? 'Save Changes' : 'Add Product'}</button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={() => { setEditingId(null); setFormData({ name: '', description: '', price: '', category: '', stockQuantity: '' }); }}
                                style={{ flex: 1, background: 'var(--danger)' }}
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <h3>Your Inventory</h3>
            {loading ? (
                <p>Loading your products...</p>
            ) : products.length === 0 ? (
                <p>You have no products listed.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {products.map(product => (
                        <div key={product._id} style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            border: '1px solid var(--border)',
                            padding: '15px',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h4 style={{ margin: '0 0 5px 0' }}>{product.name}</h4>
                                <p style={{ margin: '0', color: 'var(--text-muted)' }}>Price: ${product.price} | Stock: {product.stockQuantity}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => handleEdit(product)}
                                    style={{ background: 'var(--border)', padding: '5px 15px' }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(product._id)}
                                    style={{ background: 'var(--danger)', padding: '5px 15px' }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SellerDashboard;
