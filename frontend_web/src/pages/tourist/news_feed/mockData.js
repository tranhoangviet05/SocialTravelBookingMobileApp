export const MOCK_USERS = [
    { id: 1, name: "Thanh Trúc", username: "truc.thanh_99", avatar: "https://i.pravatar.cc/150?u=truc" },
    { id: 2, name: "Hoàng Nam", username: "nam.dev_js", avatar: "https://i.pravatar.cc/150?u=nam" },
    { id: 3, name: "Lan Anh", username: "lananh.coffee", avatar: "https://i.pravatar.cc/150?u=lananh" },
    { id: 4, name: "Trần Việt", username: "tzitttt.2909", avatar: "https://i.pravatar.cc/150?u=myprofile" },
    { id: 5, name: "Minh Quân", username: "quan.dev", avatar: "https://i.pravatar.cc/150?u=quan" },
];

export const MOCK_POSTS = [
    {
        id: 1,
        user: { name: "sun.flowe__er", avatar: "https://i.pravatar.cc/150?u=sun" },
        time: "8 giờ",
        content: "Ngoài việc làm IT ngồi code ra thì chúng ta có thể làm gì khác không (ngành khác cũng được) Thực sự bây giờ ngành IT quá đông mình bất lực rồi. Ai có thể chỉ cho mình 1 hướng đi được không",
        media: [],
        likes: 99,
        comments: 26,
        reposts: 5,
        shares: 1
    },
    {
        id: 2,
        user: { name: "nhiepanh.gia", avatar: "https://i.pravatar.cc/150?u=photo" },
        time: "10 giờ",
        content: "Vài góc máy film mình vừa chụp ở Đà Lạt cuối tuần qua. Thật sự mê cái vibe ở đây! 🌲📸",
        media: [
            "https://images.unsplash.com/photo-1555432329-1983e979f829?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
        ],
        likes: 452,
        comments: 32,
        reposts: 12,
        shares: 8
    },
    {
        id: 3,
        user: { name: "linhxinh1809", avatar: "https://i.pravatar.cc/150?u=linh" },
        time: "1 ngày",
        content: "Tha thiết xin in4 các quán cà phê học bài, làm việc ở Đà Nẵng mở tới 23-24h, có bàn ghế cao và rộng xíu ạaa 🥺\nDa Nang",
        media: [
            "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
        ],
        likes: 71,
        comments: 20,
        reposts: 3,
        shares: 4
    }
];

export const TRENDING_TOPICS = [
    { id: 1, title: "#DaLat", desc: "Đồi chè Cầu Đất đang vào mùa săn mây cực đẹp", posts: "12.5K bài viết", img: "https://images.unsplash.com/photo-1595183492723-4c92b2d07e60?w=200" },
    { id: 2, title: "#FoodReview", desc: "Top 10 quán cafe chill nhất Hội An bạn không nên bỏ lỡ", posts: "8.2K bài viết", img: "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=200" },
    { id: 3, title: "#SoloTravel", desc: "Kinh nghiệm du lịch một mình an toàn và tiết kiệm", posts: "5.4K bài viết", img: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=200" },
];
