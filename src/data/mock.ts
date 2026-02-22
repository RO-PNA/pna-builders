export const mockItem = {
    id: 1,
    title: "Example News Item",
    domain: "example.com",
    points: 156,
    user: "user123",
    time_ago: "2 hours ago",
    comments_count: 5,
    content: "This is a mock news item content. It simulates a real news article or discussion.",
    comments: [
        {
            id: 101,
            user: "commenter1",
            time_ago: "1 hour ago",
            content: "This is a very interesting article. Thanks for sharing!",
            comments: [
                {
                    id: 1011,
                    user: "reply_guy",
                    time_ago: "30 minutes ago",
                    content: "I agree, very insightful."
                }
            ]
        },
        {
            id: 102,
            user: "skeptic",
            time_ago: "45 minutes ago",
            content: "I'm not so sure about the conclusion."
        }
    ]
};
