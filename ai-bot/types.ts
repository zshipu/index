interface AITool {
    id: string;
    name: string;
    icon: string;
    description: string;
    category: string[];
    url: string;
    tags: string[];
    features: string[];
    rating: number;
    reviews: Review[];
    createdAt: Date;
    updatedAt: Date;
}

interface Category {
    id: string;
    name: string;
    icon: string;
    description: string;
    toolCount: number;
}

interface Article {
    id: string;
    title: string;
    content: string;
    category: string;
    author: string;
    tags: string[];
    publishedAt: Date;
} 