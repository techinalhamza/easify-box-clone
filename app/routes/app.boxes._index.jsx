// import { json } from "@remix-run/node";
import { useLoaderData } from "react-router";
import { Page, Card, ResourceList, Text, Button, EmptyState } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server"; // aapne prisma client export kiya tha

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  
  const boxes = await prisma.box.findMany({
    orderBy: { createdAt: "desc" }
  });
  
  return { boxes };
};

export default function BoxesIndex() {
  const { boxes } = useLoaderData();
  
  return (
    <Page
      title="Boxes"
      primaryAction={{
        content: "Create new box",
        url: "/app/boxes/new",
      }}
    >
      <Card>
        {boxes.length === 0 ? (
          <EmptyState
            heading="No boxes yet"
            action={{ content: "Create your first box", url: "/app/boxes/new" }}
          >
            <p>Start building your first build‑your‑own‑box experience.</p>
          </EmptyState>
        ) : (
          <ResourceList
            items={boxes}
            renderItem={(box) => {
              const { id, title, status, createdAt } = box;
              return (
                <ResourceList.Item
                  id={id}
                  url={`/app/boxes/${id}/edit`}
                >
                  <Text variant="bodyMd" fontWeight="bold">
                    {title}
                  </Text>
                  <div>
                    <Text variant="bodySm" tone="subdued">
                      Status: {status} • Created: {new Date(createdAt).toLocaleDateString()}
                    </Text>
                  </div>
                </ResourceList.Item>
              );
            }}
          />
        )}
      </Card>
    </Page>
  );
}
