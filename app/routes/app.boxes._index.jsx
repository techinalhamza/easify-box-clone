import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

// export const loader = async ({ request }) => {
//   const { session } = await authenticate.admin(request);
  
//   const boxes = await prisma.box.findMany({
//     where: {
//       shop: session.shop,
//     },
//     orderBy: { createdAt: "desc" }
//   });
  
//   // Return data directly, no json() wrapper needed
//   return { boxes };
// };


export const loader = async ({ request }) => {
  await authenticate.admin(request);
  
  const boxes = await prisma.box.findMany({
    // where: { shop: session.shop }, // Yeh remove karein
    orderBy: { createdAt: "desc" }
  });
  
  return { boxes };
};


export default function BoxesIndex() {
  const { boxes } = useLoaderData();
  
  return (
    <s-page title="Boxes">
      <s-button slot="primary-action" variant="primary" href="/app/boxes/new">
        Create new box
      </s-button>

      {boxes.length === 0 ? (
        <s-empty-state heading="No boxes yet">
          <s-paragraph>Start building your first build‑your‑own‑box experience.</s-paragraph>
          <s-button variant="primary" href="/app/boxes/new">
            Create your first box
          </s-button>
        </s-empty-state>
      ) : (
        <s-grid
        gridTemplateColumns="@container (inline-size > 400px) 1fr 1fr 1fr, 1fr"
        gap="base">
          <s-grid-item>
            {boxes.map((box) => (
              <s-grid-item
                key={box.id}
                url={`/app/boxes/${box.id}/edit`}
              >
                <s-text variant="bodyMd" fontWeight="bold">
                  {box.title}
                </s-text>
                <s-text variant="bodySm" tone="subdued">
                  Status: {box.status} • Created: {new Date(box.createdAt).toLocaleDateString()}
                </s-text>
                <s-button variant="primary" href={`/app/boxes/${box.id}/edit`}>
                edit
              </s-button>
              </s-grid-item>
            ))}
          </s-grid-item>
        </s-grid>
      )}
    </s-page>
  );
}