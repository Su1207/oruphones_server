export const newUserValidator = async (req, res, next) => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const { email } = req.body;
    if (!emailRegex.test(email)) {
        return res.status(401).json({ error: "Inavlid email" });
    }
    next();
};
