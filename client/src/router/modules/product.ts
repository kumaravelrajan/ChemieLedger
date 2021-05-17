const productRouter = {
  path: "/product",
  component: () => import("../../views/product/ProductLayout.vue"),
  redirect: "/product/overview",
  hidden: true,
  meta: {
    title: "Produkte"
  },
  children: [
    {
      path: "overview",
      component: () => import("../../views/general/Product.vue"),
      hidden: true,
      meta: {
        title: "Produktkatalog",
        roles: ["regular", "editor", "admin"]
      }
    },
    {
      path: "productoverview",
      component: () => import("../../views/product/ProductOverview.vue"),
      meta: {
        title: "Produkte",
        roles: ["regular", "editor", "admin"],
        icon: "event_note"
      }
    },
    {
      path: ":id",
      component: () => import("../../views/product/ProductView.vue"),
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
