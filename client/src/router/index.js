import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

import BaseLayout from "@/views/BaseLayout";
import adminRouter from "./modules/admin";
import editorRouter from "./modules/editorial";
import explorerRouter from "./modules/explorer";
import productRouter from "./modules/product";
import dashboardRouter from "./modules/dashboard";

/**
 *
 * Description of a route
 *
 * name: 'router-name'        the name of the route
 * redirect: 'path'           if set, redirect to this path
 * hidden: true               hides the element from the sidebar
 * props: true
 *
 * meta: {
 *  title:                    sets the Title of the Page and the sidebar
 *  icon: "svg-name"          the icon which appears in the sidebar
 *  notificationtype: "TYPE"  ask the server for notifications and show an alert if there are new ones
 *  roles: ["admin", ...]     sets, which user roles can access the route
 *    (Rohstoffbörse: admin, editor, regular, guest)
 * }
 */

/**
 * Routes definition
 */
export const definedRoutes = [
  {
    path: "/",
    component: BaseLayout,
    redirect: "/home",
    hidden: true,
    meta: {
      title: "",
    },
    children: [
      {
        path: "/home",
        component: () => import("@/views/general/Home"),
        hidden: true,
        meta: {
          title: "Home",
        },
      },
      {
        path: "/reset_password/:token",
        component: () => import("@/views/auth/ChangePassword"),
        hidden: true,
        props: true,
        meta: {
          title: "Passwort Ändern",
        },
      },
      {
        path: "/email_verification/:token",
        component: () =>
          import("@/views/EmailVerification/EmailVerificationView"),
        hidden: true,
        props: true,
        meta: {
          title: "Email Verifikation",
        },
      },
      {
        path: "/unverified",
        component: () => import("@/views/EmailVerification/LockScreenView"),
        hidden: true,
        meta: {
          title: "Email nicht verifiziert",
        },
      },
      {
        path: "/request_password",
        component: () => import("@/views/auth/ResetPasswordRequest"),
        hidden: true,
        meta: {
          title: "Passwort beantragen",
          roles: ["guest"],
        },
      },
      {
        path: "/about",
        component: () => import("@/views/general/About"),
        hidden: true,
        meta: {
          title: "Über Uns",
        },
      },
      {
        path: "/contact",
        component: () => import("@/views/general/Contact"),
        hidden: true,
        meta: {
          title: "Kontakt",
        },
      },
      {
        path: "/example",
        component: () => import("@/views/general/Example"),
        hidden: true,
        meta: {
          title: "Anwendungsbeispiele",
        },
      },
      {
        path: "/imprint",
        component: () => import("@/views/general/Imprint"),
        hidden: true,
        meta: {
          title: "Impressum",
        },
      },
      {
        path: "/privacy",
        component: () => import("@/views/general/Privacy"),
        hidden: true,
        meta: {
          title: "Datenschutz",
        },
      },
      {
        path: "/404",
        component: () => import("@/views/error/NotFound"),
        hidden: true,
        meta: {
          title: "Not found",
        },
      },
      {
        path: "/login",
        component: () => import("@/views/auth/Login"),
        meta: {
          title: "Login",
          icon: "person",
          roles: ["guest"],
        },
      },
      {
        path: "/register",
        component: () => import("@/views/auth/Register"),
        meta: {
          title: "Account Erstellen",
          icon: "add",
          roles: ["guest"],
        },
      },
      {
        path: "/article/:id",
        component: () => import("@/views/general/Article"),
        hidden: true,
        props: true,
        meta: {
          title: "Artikel",
        },
      },
      dashboardRouter,
      productRouter,
      explorerRouter,
      adminRouter,
      editorRouter,
      {
        path: "/logout",
        component: () => import("@/views/auth/LogoutRedirect"),
        meta: {
          title: "Logout",
          icon: "exit_to_app",
          roles: ["regular", "editor", "admin"],
        },
      },
    ],
  },

  // 404 page must be placed at the end !!!
  {
    path: "*",
    redirect: "/404",
    hidden: true,
  },
];

const createRouter = () =>
  new Router({
    mode: "history",
    scrollBehavior: () => ({ y: 0 }),
    routes: definedRoutes,
  });

const router = createRouter();

export default router;
