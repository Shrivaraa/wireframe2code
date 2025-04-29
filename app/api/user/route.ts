import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/configs/db";
import { usersTable } from "@/configs/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    if (!body) {
      return NextResponse.json(
        { error: "Empty request body" },
        { status: 400 }
      );
    }

    const { userEmail, userName } = JSON.parse(body);
    if (!userEmail || !userName) {
      return NextResponse.json(
        { error: "Missing userEmail or userName" },
        { status: 400 }
      );
    }

    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, userEmail));

    if (existingUser.length === 0) {
      const insertedUser = await db
        .insert(usersTable)
        .values({
          name: userName,
          email: userEmail,
          credits: 3,
        })
        .returning();

      return NextResponse.json(insertedUser[0]);
    }

    return NextResponse.json(existingUser[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Missing email parameter" },
        { status: 400 }
      );
    }

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
