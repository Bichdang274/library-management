// -- BOOK INTERFACE --
export interface Book {
    book_id: number;
    name: string;
    author: string | null;
    publisher: string | null;
    year_published: number | null;
    category_id: number;
    category_name?: string; 
    total_copies: number;
    available_copies: number;
    image_url?: string;

}

// -- CATEGORY INTERFACE --
export interface Category {
    category_id: number;
    category_name: string;
}