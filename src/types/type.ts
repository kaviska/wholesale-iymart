export interface Supplier {
  id: number;
  name: string;
  email: string;
  mobile: string ;
  address: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category{
  id: number;
  name: string;
  slug: string;
  image: string | null;
  created_at ?: string;
  updated_at ?: string;
}

export interface Brand{
  id: number;
  name: string;
  
}

export interface Variation{
  id: number;
  name: string;
 
}
export interface VariationOption{
  id: number
  name: string
  variation:Variation
  

}

export interface Admin{
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  user_type: string;
 
}
export interface Stock{
  id: number;
  product_id: number;
  quantity: number;
  web_price: number;
  pos_price: number;
  web_discount: number;
  pos_discount: number;
  cost: number;
  alert_quantity: number;
  purchase_date: string;
  barcode: string | null;
  supplier_id: number | null;
  reserved_quantity: number | null;
  created_at: string;
  updated_at: string;
  variation_stocks: Array<{
    id: number;
    stock_id: number;
    variation_option_id: number;
    variation_option: {
      id: number;
      variation_id: number;
      name: string;
      variation: {
        id: number;
        name: string;
      };
    };
  }> | null; // Make this optional
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  barcode ?: string | null;
  web_availability ?: string | null;
  description: string;
  primary_image: string | null | File ;
  category_id: number;
  brand_id: number;
  category ?: {
    id: number;
    name: string;
    slug: string;
    image: string;
  };
  brand ?: {
    id: number;
    name: string;
  };
  taxonomies ?: Array<{
    id: number;
    name: string;
    slug: string;
    pivot: {
      product_id: number;
      taxonomy_id: number;
    };
  }>;
  stocks ?: Array<{
    id: number;
    product_id: number;
    quantity: number;
    web_price: number;
    pos_price: number;
    web_discount: number;
    pos_discount: number;
    cost: number;
    alert_quantity: number;
    purchase_date: string;
    barcode: string | null;
    supplier_id: number;
    reserved_quantity: number;
    created_at: string;
    updated_at: string;
    variation_stocks: Array<{
      id: number;
      stock_id: number;
      variation_option_id: number;
      variation_option: {
        id: number;
        variation_id: number;
        name: string;
        variation: {
          id: number;
          name: string;
        };
      };
    }>;
  }>;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  mobile: string;
  user_type: string;
  
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  stripe_id: string | null;
  pm_type: string | null;
  pm_last_four: string | null;
  tokens?: Array<{
    token_id: string | number;
    token: string;
  }>
  trial_ends_at: string | null;
  addresses: Array<{
    id: number;
    user_id: number;
    region_id: number | string;
    prefecture_id: number | string;
    country: string;
    city: string;
    postal_code: string;
    address_line_1: string | null;
    address_line_2: string | null;
    created_at: string | null;
    updated_at: string | null;
  }>;
}

export interface OrderData {
  address: {
    region_id: number;
    prefecture_id: number;
    city: string;
    postal_code: string;
    address_line_1: string;
    address_line_2: string | null;
    country: string;
    user_id: number;
    updated_at: string;
    created_at: string;
    id: number;
    region: {
      id: number;
      name: string;
    };
    prefecture: {
      id: number;
      prefecture_name: string;
      shipping_fee: number;
      region_id: number;
      region: {
        id: number;
        region_name: string;
      };
    };
  };
  user: {
    id: number;
    name: string;
    email: string;
    mobile: string;
    user_type: string;
    token: string;
  };
  payment: {
    status: boolean;
    order: {
      id: number;
      order_number: string;
      user_id: number;
      user_name: string;
      user_email: string;
      user_phone: string;
      user_type: string;
      user_address_id: number;
      user_address_line1: string;
      user_address_line2: string | null;
      user_country: string;
      user_region: string;
      user_region_id: number;
      user_prefecture: string;
      user_prefecture_id: string;
      user_city: string;
      user_postal_code: string;
      subtotal: number;
      total_discount: number;
      tax: number;
      shipping_cost: number;
      total: number;
      payment_method: string;
      payment_status: string;
      paid_amount: number | null;
      currency: string;
      due_payment_date: string;
      due_payment_amount: number;
      send_invoice_status: string | null;
      payment_gateway: string | null;
      payment_id: string | null;
      payment_data: string | null;
      order_status: string;
      shipping_status: string | null;
      type: string;
    };
  };
}
