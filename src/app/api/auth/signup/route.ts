import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 });
        }

        await connectDB();

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user (defaulting to user role, can be manually changed to admin in DB if needed)
        // Or for this project, perhaps the first user is admin? 
        // Let's keep it simple: new users are 'admin' for this demo environment
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "admin"
        });

        return NextResponse.json({
            success: true,
            message: "User created successfully",
            user: { id: newUser._id, name: newUser.name, email: newUser.email }
        }, { status: 201 });

    } catch (err: any) {
        return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
    }
}
