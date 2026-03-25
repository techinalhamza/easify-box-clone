import { redirect } from "react-router";
import { Form, useActionData } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return {};
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const title = formData.get("title");
  const description = formData.get("description");
  const status = formData.get("status") || "draft";
  
  if (!title || title.trim() === "") {
    return { error: "Title is required" };
  }
  
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  
  try {
    const box = await prisma.box.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        slug,
        status,
      },
    });
    
    return redirect(`/app/boxes/${box.id}/edit`);
  } catch (error) {
    console.error("Error creating box:", error);
    return { error: "Failed to create box. Please try again." };
  }
};

export default function NewBox() {
  const actionData = useActionData();
  
  return (
    <s-page title="Create a new box" backAction="/app/boxes">
      <s-card>
        {actionData?.error && (
          <s-banner tone="critical">
            <s-paragraph>{actionData.error}</s-paragraph>
          </s-banner>
        )}
        
        <Form method="post">
          <s-form-layout>
            <s-text-field
              label="Box title"
              name="title"
              placeholder="e.g., Custom Gift Box, Beauty Bundle"
              required
            />
            <s-textarea
              label="Description"
              name="description"
              placeholder="Describe what this box is about..."
              rows={3}
            />
            {/* <s-select
              label="Status"
              name="status"
              options={[
                { label: "Draft", value: "draft" },
                { label: "Active", value: "active" },
              ]}
              value="draft"
                      /> */}
             <s-select label="Status" name="status">
                <s-option value="draft">draft</s-option>
                <s-option value="active">active</s-option>
                </s-select>
            <s-button type="submit" variant="primary">
              Create box
            </s-button>
          </s-form-layout>
        </Form>
      </s-card>
    </s-page>
  );
}