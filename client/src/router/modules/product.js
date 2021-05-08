const productRouter = {
  path: "/product",
  component: () => import("@/views/product/ProductLayout"),
  redirect: "/product/overview",
  hidden: true,
  meta: {
    title: "Produkte"
  },
  children: [
    {
      path: "overview",
      component: () => import("@/views/general/Product"),
      hidden: true,
      meta: {
        title: "Produktkatalog",
        roles: ["regular", "editor", "admin"]
      }
    },
    {
      path: "productoverview",
      component: () => import("@/views/product/ProductOverview"),
      meta: {
        title: "Produkte",
        roles: ["regular", "editor", "admin"],
        icon: "event_note"
      }
    },
    {
      path: ":id",
      component: () => import("@/views/product/ProductView"),
      hidden: true,
      props: true,
      meta: {
        title: "Produkt",
        roles: ["regular", "editor", "admin"]
      }
    }
  ]
};

export default productRouter;
