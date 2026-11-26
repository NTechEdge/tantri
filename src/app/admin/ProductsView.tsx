'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { IconCamera, IconClose, IconStar } from '@/components/Icons';
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from '@/lib/demo-data';
import type { Category, Product } from '@/lib/types';
import { tk, useAdmin } from './AdminShell';

const splitList = (s: string) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

async function compressImageFile(file: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Only JPG, PNG, or WebP images are allowed');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`"${file.name}" exceeds the 5MB limit`);
  }
  const raw = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });
  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 1000;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(raw);
      ctx.drawImage(img, 0, 0, w, h);
      const out = canvas.toDataURL('image/webp', 0.82);
      resolve(out.startsWith('data:image/webp') ? out : canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => resolve(raw);
    img.src = raw;
  });
}

interface ProductFormState {
  id?: string;
  name: string;
  name_bn: string;
  category_id: string;
  price: string;
  sale_price: string;
  stock: string;
  sku: string;
  material: string;
  origin: string;
  sizes: string;
  colors: string;
  images: string[];
  description: string;
  description_bn: string;
  featured: boolean;
  active: boolean;
}

export function ProductsView() {
  const { toast } = useAdmin();
  const [cats, setCats] = useState<Category[]>(DEMO_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [prodModal, setProdModal] = useState<ProductFormState | null>(null);
  const [modalErr, setModalErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingImgs, setUploadingImgs] = useState(false);

  const loadProducts = useCallback(async () => {
    const [catRes, prodRes] = await Promise.all([
      fetch('/api/categories').catch(() => null),
      fetch('/api/admin/products').catch(() => null),
    ]);
    if (catRes?.ok) {
      const c = await catRes.json();
      if (Array.isArray(c) && c.length) setCats(c);
    }
    if (prodRes?.ok) {
      const p = await prodRes.json();
      if (Array.isArray(p)) setProducts(p);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const openProductModal = (p?: Product) => {
    setModalErr('');
    setUploadingImgs(false);
    setProdModal({
      id: p?.id,
      name: p?.name || '',
      name_bn: p?.name_bn || '',
      category_id: p?.category_id || cats[0]?.id || '',
      price: p ? String(p.price) : '',
      sale_price: p?.sale_price ? String(p.sale_price) : '',
      stock: p ? String(p.stock) : '10',
      sku: p?.sku || '',
      material: p?.material || '100% cotton',
      origin: p?.origin || 'Made in Bangladesh',
      sizes: (p?.sizes || []).join(', '),
      colors: (p?.colors || []).join(', '),
      images: p?.images ? [...p.images] : [],
      description: p?.description || '',
      description_bn: p?.description_bn || '',
      featured: Boolean(p?.featured),
      active: p ? p.active !== false && p.active !== 0 : true,
    });
  };

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files?.length || !prodModal) return;
    setModalErr('');
    setUploadingImgs(true);
    try {
      const added: string[] = [];
      for (const f of Array.from(files)) {
        added.push(await compressImageFile(f));
      }
      setProdModal((prev) => (prev ? { ...prev, images: [...prev.images, ...added] } : prev));
    } catch (err) {
      setModalErr(err instanceof Error ? err.message : 'Failed to load image');
    } finally {
      setUploadingImgs(false);
    }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodModal) return;
    setModalErr('');
    setSaving(true);
    const body = {
      name: prodModal.name.trim(),
      name_bn: prodModal.name_bn.trim(),
      category_id: prodModal.category_id,
      price: Number(prodModal.price),
      sale_price: prodModal.sale_price ? Number(prodModal.sale_price) : null,
      stock: Number(prodModal.stock || 0),
      sku: prodModal.sku.trim(),
      material: prodModal.material.trim(),
      origin: prodModal.origin.trim() || 'Made in Bangladesh',
      sizes: splitList(prodModal.sizes),
      colors: splitList(prodModal.colors),
      images: prodModal.images,
      description: prodModal.description.trim(),
      description_bn: prodModal.description_bn.trim(),
      featured: prodModal.featured,
      active: prodModal.active,
    };

    try {
      const r = await fetch('/api/admin/products' + (prodModal.id ? `/${prodModal.id}` : ''), {
        method: prodModal.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Failed to save product');
      setProdModal(null);
      toast(prodModal.id ? 'Product updated' : 'Product added');
      await loadProducts();
    } catch (err) {
      setModalErr(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"? (If it has past orders it will be hidden instead.)`)) return;
    try {
      const r = await fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Failed to delete');
      toast(d.archived ? 'Product hidden (has orders)' : 'Product deleted');
      await loadProducts();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <>
      <div className="adm-top">
        <h1>Products</h1>
        <button className="adm-btn" onClick={() => openProductModal()}>
          + Add product
        </button>
      </div>
      <div className="adm-card">
        <table>
          <thead>
            <tr>
              <th />
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr className="hv" key={p.id}>
                <td>
                  <img className="adm-th" src={p.images[0] || '/img/logo-mark.svg'} alt={p.name} />
                </td>
                <td>
                  <b>{p.name}</b>
                  <br />
                  <small className="adm-mut adm-feat">
                    {p.sku}
                    {p.featured && (
                      <span className="adm-feat-tag">
                        {' '}
                        · <IconStar size={12} /> featured
                      </span>
                    )}
                  </small>
                </td>
                <td>{p.category_name || cats.find((c) => c.id === p.category_id)?.name}</td>
                <td>
                  {p.sale_price ? (
                    <>
                      <b>{tk(p.sale_price)}</b> <s className="adm-mut">{tk(p.price)}</s>
                    </>
                  ) : (
                    <b>{tk(p.price)}</b>
                  )}
                </td>
                <td>
                  <span className={`adm-pill ${p.stock > 5 ? 'on' : p.stock ? '' : 'off'}`}>{p.stock}</span>
                </td>
                <td>
                  <span className={`adm-pill ${p.active !== false && p.active !== 0 ? 'on' : 'off'}`}>
                    {p.active !== false && p.active !== 0 ? 'Live' : 'Hidden'}
                  </span>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button className="adm-btn sm o" onClick={() => openProductModal(p)}>
                    Edit
                  </button>{' '}
                  <button className="adm-btn sm r" onClick={() => deleteProduct(p)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {prodModal && (
        <>
          <div className="adm-mback" onClick={() => setProdModal(null)} />
          <form className="adm-mdl" onSubmit={saveProduct}>
            <h2>{prodModal.id ? 'Edit product' : 'Add product'}</h2>
            <div className="adm-f2">
              <div className="fld">
                <label>Name (English)</label>
                <input
                  required
                  value={prodModal.name}
                  onChange={(e) => setProdModal({ ...prodModal, name: e.target.value })}
                />
              </div>
              <div className="fld">
                <label>নাম (বাংলা)</label>
                <input
                  value={prodModal.name_bn}
                  onChange={(e) => setProdModal({ ...prodModal, name_bn: e.target.value })}
                />
              </div>
            </div>
            <div className="adm-f3">
              <div className="fld">
                <label>Category</label>
                <select
                  value={prodModal.category_id}
                  onChange={(e) => setProdModal({ ...prodModal, category_id: e.target.value })}
                >
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="fld">
                <label>Price (৳)</label>
                <input
                  type="number"
                  required
                  value={prodModal.price}
                  onChange={(e) => setProdModal({ ...prodModal, price: e.target.value })}
                />
              </div>
              <div className="fld">
                <label>Sale price (৳, optional)</label>
                <input
                  type="number"
                  value={prodModal.sale_price}
                  onChange={(e) => setProdModal({ ...prodModal, sale_price: e.target.value })}
                />
              </div>
            </div>
            <div className="adm-f3">
              <div className="fld">
                <label>Stock</label>
                <input
                  type="number"
                  value={prodModal.stock}
                  onChange={(e) => setProdModal({ ...prodModal, stock: e.target.value })}
                />
              </div>
              <div className="fld">
                <label>SKU</label>
                <input value={prodModal.sku} onChange={(e) => setProdModal({ ...prodModal, sku: e.target.value })} />
              </div>
              <div className="fld">
                <label>Material</label>
                <input
                  value={prodModal.material}
                  onChange={(e) => setProdModal({ ...prodModal, material: e.target.value })}
                />
              </div>
            </div>
            <div className="adm-f2">
              <div className="fld">
                <label>Sizes / lengths (comma separated)</label>
                <input
                  placeholder="S, M, L, XL"
                  value={prodModal.sizes}
                  onChange={(e) => setProdModal({ ...prodModal, sizes: e.target.value })}
                />
              </div>
              <div className="fld">
                <label>Colours (comma separated)</label>
                <input
                  placeholder="Maroon, Indigo"
                  value={prodModal.colors}
                  onChange={(e) => setProdModal({ ...prodModal, colors: e.target.value })}
                />
              </div>
            </div>
            <div className="fld">
              <label>Origin</label>
              <input value={prodModal.origin} onChange={(e) => setProdModal({ ...prodModal, origin: e.target.value })} />
            </div>
            <div className="fld">
              <label>Images (first one is the main photo)</label>
              {prodModal.images.length > 0 && (
                <div className="adm-imgs">
                  {prodModal.images.map((u, idx) => (
                    <div className="adm-img-item" key={idx}>
                      <img src={u} alt="" />
                      {idx === 0 && <span className="adm-img-main">Main</span>}
                      <button
                        type="button"
                        className="adm-img-rm"
                        aria-label="Remove image"
                        onClick={() =>
                          setProdModal({
                            ...prodModal,
                            images: prodModal.images.filter((_, i) => i !== idx),
                          })
                        }
                      >
                        <IconClose size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="adm-drop" style={{ display: 'flex', marginBottom: 0 }}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  hidden
                  disabled={uploadingImgs}
                  onChange={(e) => {
                    void handlePhotoUpload(e.target.files);
                    e.target.value = '';
                  }}
                />
                <IconCamera size={17} />
                <span>{uploadingImgs ? 'Processing photos…' : 'Click to upload photos (JPG / PNG / WebP, max 5MB)'}</span>
              </label>
            </div>
            <div className="adm-f2">
              <div className="fld">
                <label>Description (English)</label>
                <textarea
                  rows={3}
                  value={prodModal.description}
                  onChange={(e) => setProdModal({ ...prodModal, description: e.target.value })}
                />
              </div>
              <div className="fld">
                <label>বিবরণ (বাংলা)</label>
                <textarea
                  rows={3}
                  value={prodModal.description_bn}
                  onChange={(e) => setProdModal({ ...prodModal, description_bn: e.target.value })}
                />
              </div>
            </div>
            <div className="adm-chk">
              <label>
                <input
                  type="checkbox"
                  checked={prodModal.featured}
                  onChange={(e) => setProdModal({ ...prodModal, featured: e.target.checked })}
                />{' '}
                Featured on home page
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={prodModal.active}
                  onChange={(e) => setProdModal({ ...prodModal, active: e.target.checked })}
                />{' '}
                Visible in store
              </label>
            </div>
            {modalErr && <div className="err">{modalErr}</div>}
            <div className="adm-acts">
              <button type="button" className="adm-btn o" onClick={() => setProdModal(null)}>
                Cancel
              </button>
              <button type="submit" className="adm-btn" disabled={saving || uploadingImgs}>
                {saving ? 'Saving…' : 'Save product'}
              </button>
            </div>
          </form>
        </>
      )}
    </>
  );
}
