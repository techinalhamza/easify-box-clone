import { redirect } from "react-router";
import { Form, useLoaderData, useActionData } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ params, request }) => {
  const { session } = await authenticate.admin(request);
  
  const box = await prisma.box.findFirst({
    where: {
      id: params.id,
    },
    include: {
      steps: {
        orderBy: { order: "asc" },
      },
      customFields: true,
    },
  });
  
  if (!box) {
    throw new Response("Box not found", { status: 404 });
  }
  
  return { box };
};

export const action = async ({ params, request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const title = formData.get("title");
  const description = formData.get("description");
  const status = formData.get("status");
  const discountType = formData.get("discountType");
  const discountValue = formData.get("discountValue");
  
  try {
    const existingBox = await prisma.box.findFirst({
      where: { id: params.id},
    });
    
    let slug = existingBox.slug;
    if (title !== existingBox.title) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
    
    await prisma.box.update({
      where: { id: params.id },
      data: {
        title: title.trim(),
        description: description?.trim(),
        status,
        slug,
        discountType: discountType || null,
        discountValue: discountValue ? parseFloat(discountValue) : null,
      },
    });
    
    return redirect("/app/boxes");
  } catch (error) {
    console.error("Error updating box:", error);
    return { error: "Failed to update box" };
  }
};

export default function EditBox() {
  const { box } = useLoaderData();
  const actionData = useActionData();
  console.log(box)
  return (
    <s-page title={`Edit: ${box.title}`} backAction="/app/boxes">
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
              defaultValue={box.title}
              required
            />
            <s-textarea
              label="Description"
              name="description"
              defaultValue={box.description || ""}
              rows={3}
            />
            {/* <s-select
              label="Status"
              name="status"
              options={[
                { label: "Draft", value: "draft" },
                { label: "Active", value: "active" },
              ]}
              value={box.status}
            /> */}
            <s-select label="Status" name="status" value={box.status || "draft"}>
                <s-option value="draft">draft</s-option>
                <s-option value="active">active</s-option>
                </s-select>
            <s-text-field
              label="Discount Type"
              name="discountType"
              placeholder="percentage, fixed, tiered"
              defaultValue={box.discountType || ""}
              helpText="Leave empty for no discount"
            />
            <s-text-field
              label="Discount Value"
              name="discountValue"
              type="number"
              placeholder="10, 20.5, etc."
              defaultValue={box.discountValue || ""}
              helpText="For percentage, use numbers like 10 for 10%"
            />
            <s-button type="submit" variant="primary">
              Save changes
            </s-button>
          </s-form-layout>
        </Form>
      </s-card>
      
      <s-card>
        <s-heading>Steps ({box.steps?.length || 0})</s-heading>
        <s-stack direction="block" gap="base">
          <s-paragraph>Manage the steps customers go through to build their box.</s-paragraph>
          <s-button
            variant="secondary"
            onClick={() => {
              alert("Steps management will be added in Step 4");
            }}
          >
            Manage steps
          </s-button>
        </s-stack>
      </s-card>
      
      <s-card>
        <s-heading>Custom Fields ({box.customFields?.length || 0})</s-heading>
        <s-stack direction="block" gap="base">
          <s-paragraph>Add gift messages, file uploads, date pickers, and more.</s-paragraph>
          <s-button
            variant="secondary"
            onClick={() => {
              alert("Custom fields will be added later");
            }}
          >
            Manage custom fields
          </s-button>
        </s-stack>
      </s-card>
    </s-page>
  );
}