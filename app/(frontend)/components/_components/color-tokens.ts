// Per-component colour tokens, generated from the Figma export
// (Lisbon-Project---DS, Light mode). Each token maps to the live CSS variable it
// references in globals.css (so it tracks light/dark); chatbot is a one-off hex.
// Source of truth is Figma — regenerate from the variables export if it changes.

export type ComponentToken = { name: string; var?: string; hex?: string };
export type ComponentGroup = { component: string; tokens: ComponentToken[] };

export const COMPONENT_TOKENS: ComponentGroup[] = [
  {
    "component": "breadcrumb",
    "tokens": [
      {
        "name": "label/non-interactive",
        "var": "--brand-1000"
      },
      {
        "name": "label/interactive",
        "var": "--brand-500"
      },
      {
        "name": "divider",
        "var": "--neutral-500"
      }
    ]
  },
  {
    "component": "button-link",
    "tokens": [
      {
        "name": "label/default",
        "var": "--brand-500"
      },
      {
        "name": "label/hover",
        "var": "--brand-700"
      },
      {
        "name": "label/press",
        "var": "--brand-900"
      },
      {
        "name": "icon/default",
        "var": "--brand-500"
      },
      {
        "name": "icon/hover",
        "var": "--brand-700"
      },
      {
        "name": "icon/press",
        "var": "--brand-900"
      }
    ]
  },
  {
    "component": "button-primary",
    "tokens": [
      {
        "name": "background/default",
        "var": "--brand-primary"
      },
      {
        "name": "background/hover",
        "var": "--brand-600"
      },
      {
        "name": "background/press",
        "var": "--brand-700"
      },
      {
        "name": "background/disabled",
        "var": "--brand-100"
      },
      {
        "name": "label/default",
        "var": "--brand-000"
      },
      {
        "name": "label/hover",
        "var": "--brand-000"
      },
      {
        "name": "label/press",
        "var": "--brand-000"
      },
      {
        "name": "label/disabled",
        "var": "--neutral-300"
      },
      {
        "name": "icon/default",
        "var": "--brand-000"
      },
      {
        "name": "icon/hover",
        "var": "--brand-000"
      },
      {
        "name": "icon/press",
        "var": "--brand-000"
      },
      {
        "name": "icon/disabled",
        "var": "--neutral-300"
      }
    ]
  },
  {
    "component": "button-secondary",
    "tokens": [
      {
        "name": "background/default",
        "var": "--brand-000"
      },
      {
        "name": "background/hover",
        "var": "--brand-100"
      },
      {
        "name": "background/press",
        "var": "--brand-200"
      },
      {
        "name": "background/disabled",
        "var": "--brand-000"
      },
      {
        "name": "border/default",
        "var": "--brand-300"
      },
      {
        "name": "border/hover",
        "var": "--brand-300"
      },
      {
        "name": "border/press",
        "var": "--brand-300"
      },
      {
        "name": "border/disabled",
        "var": "--brand-200"
      },
      {
        "name": "label/default",
        "var": "--brand-primary"
      },
      {
        "name": "label/hover",
        "var": "--brand-primary"
      },
      {
        "name": "label/press",
        "var": "--brand-primary"
      },
      {
        "name": "label/disabled",
        "var": "--brand-200"
      },
      {
        "name": "icon/default",
        "var": "--brand-primary"
      },
      {
        "name": "icon/hover",
        "var": "--brand-primary"
      },
      {
        "name": "icon/press",
        "var": "--brand-primary"
      },
      {
        "name": "icon/disabled",
        "var": "--brand-200"
      }
    ]
  },
  {
    "component": "button-tertiary",
    "tokens": [
      {
        "name": "label/default",
        "var": "--brand-600"
      },
      {
        "name": "label/hover",
        "var": "--brand-800"
      },
      {
        "name": "label/press",
        "var": "--brand-900"
      },
      {
        "name": "label/disabled",
        "var": "--brand-200"
      },
      {
        "name": "icon/default",
        "var": "--brand-500"
      },
      {
        "name": "icon/hover",
        "var": "--brand-600"
      },
      {
        "name": "icon/press",
        "var": "--brand-700"
      },
      {
        "name": "icon/disabled",
        "var": "--brand-200"
      },
      {
        "name": "icon-background/hover",
        "var": "--brand-200"
      },
      {
        "name": "icon-background/press",
        "var": "--brand-300"
      },
      {
        "name": "icon-background/disabled",
        "var": "--brand-200"
      }
    ]
  },
  {
    "component": "button-menu",
    "tokens": [
      {
        "name": "label/default",
        "var": "--brand-600"
      },
      {
        "name": "label/hover",
        "var": "--brand-600"
      },
      {
        "name": "label/press",
        "var": "--brand-900"
      },
      {
        "name": "label/disabled",
        "var": "--brand-200"
      },
      {
        "name": "icon/default",
        "var": "--brand-600"
      },
      {
        "name": "icon/hover",
        "var": "--brand-600"
      },
      {
        "name": "icon/press",
        "var": "--brand-900"
      },
      {
        "name": "icon/disabled",
        "var": "--brand-200"
      },
      {
        "name": "background/hover",
        "var": "--brand-200"
      },
      {
        "name": "background/press",
        "var": "--brand-300"
      },
      {
        "name": "background/selected",
        "var": "--brand-000"
      },
      {
        "name": "border/selected",
        "var": "--brand-400"
      }
    ]
  },
  {
    "component": "card",
    "tokens": [
      {
        "name": "background",
        "var": "--brand-000"
      },
      {
        "name": "border",
        "var": "--brand-200"
      }
    ]
  },
  {
    "component": "card-article",
    "tokens": [
      {
        "name": "icon",
        "var": "--brand-500"
      },
      {
        "name": "title",
        "var": "--text-primary"
      },
      {
        "name": "description",
        "var": "--text-primary"
      }
    ]
  },
  {
    "component": "card-schedule",
    "tokens": [
      {
        "name": "icon",
        "var": "--brand-500"
      },
      {
        "name": "title",
        "var": "--brand-primary"
      }
    ]
  },
  {
    "component": "card-service",
    "tokens": [
      {
        "name": "iconbackgorund",
        "var": "--brand-100"
      },
      {
        "name": "icon",
        "var": "--brand-500"
      },
      {
        "name": "title",
        "var": "--text-primary"
      },
      {
        "name": "description",
        "var": "--text-primary"
      }
    ]
  },
  {
    "component": "card-shortcut",
    "tokens": [
      {
        "name": "icon",
        "var": "--brand-300"
      },
      {
        "name": "title",
        "var": "--text-primary"
      },
      {
        "name": "description",
        "var": "--text-primary"
      }
    ]
  },
  {
    "component": "checkbox-primary",
    "tokens": [
      {
        "name": "background/default",
        "var": "--neutral-200"
      },
      {
        "name": "background/hover",
        "var": "--neutral-300"
      },
      {
        "name": "background/pressed",
        "var": "--neutral-300"
      },
      {
        "name": "background/selected",
        "var": "--brand-000"
      },
      {
        "name": "background/error",
        "var": "--neutral-200"
      },
      {
        "name": "border/default",
        "var": "--neutral-500"
      },
      {
        "name": "border/hover",
        "var": "--neutral-600"
      },
      {
        "name": "border/pressed",
        "var": "--neutral-700"
      },
      {
        "name": "border/selected",
        "var": "--brand-600"
      },
      {
        "name": "border/error",
        "var": "--negative"
      },
      {
        "name": "text/default",
        "var": "--neutral-800"
      },
      {
        "name": "text/selected",
        "var": "--brand-600"
      },
      {
        "name": "icon/selected",
        "var": "--brand-600"
      },
      {
        "name": "error-message",
        "var": "--negative"
      }
    ]
  },
  {
    "component": "checkbox-secondary",
    "tokens": [
      {
        "name": "background/default",
        "var": "--brand-100"
      },
      {
        "name": "background/hover",
        "var": "--brand-100"
      },
      {
        "name": "background/pressed",
        "var": "--brand-200"
      },
      {
        "name": "background/selected",
        "var": "--brand-100"
      },
      {
        "name": "background/error",
        "var": "--brand-000"
      },
      {
        "name": "border/default",
        "var": "--brand-300"
      },
      {
        "name": "border/hover",
        "var": "--brand-400"
      },
      {
        "name": "border/pressed",
        "var": "--brand-400"
      },
      {
        "name": "border/selected",
        "var": "--brand-500"
      },
      {
        "name": "border/error",
        "var": "--negative"
      },
      {
        "name": "text/default",
        "var": "--neutral-800"
      },
      {
        "name": "text/hover",
        "var": "--neutral-800"
      },
      {
        "name": "text/pressed",
        "var": "--neutral-800"
      },
      {
        "name": "text/selected",
        "var": "--brand-500"
      },
      {
        "name": "icon/selected",
        "var": "--brand-500"
      },
      {
        "name": "error-message",
        "var": "--negative"
      }
    ]
  },
  {
    "component": "divider",
    "tokens": [
      {
        "name": "border",
        "var": "--brand-200"
      }
    ]
  },
  {
    "component": "dropdown",
    "tokens": [
      {
        "name": "background/default",
        "var": "--neutral-100"
      },
      {
        "name": "background/hover",
        "var": "--neutral-200"
      },
      {
        "name": "background/press",
        "var": "--neutral-200"
      },
      {
        "name": "background/active",
        "var": "--brand-000"
      },
      {
        "name": "background/error",
        "var": "--neutral-100"
      },
      {
        "name": "background/disabled",
        "var": "--neutral-200"
      },
      {
        "name": "border/disabled",
        "var": "--neutral-200"
      },
      {
        "name": "border/default",
        "var": "--neutral-300"
      },
      {
        "name": "border/hover",
        "var": "--neutral-600"
      },
      {
        "name": "border/press",
        "var": "--neutral-900"
      },
      {
        "name": "border/active",
        "var": "--brand-primary"
      },
      {
        "name": "border/error",
        "var": "--negative"
      },
      {
        "name": "label/default",
        "var": "--neutral-1000"
      },
      {
        "name": "label/hover",
        "var": "--neutral-1000"
      },
      {
        "name": "label/press",
        "var": "--neutral-1000"
      },
      {
        "name": "label/active",
        "var": "--brand-primary"
      },
      {
        "name": "label/error",
        "var": "--negative"
      },
      {
        "name": "label/disabled",
        "var": "--neutral-1000"
      },
      {
        "name": "text/placeholder",
        "var": "--neutral-500"
      },
      {
        "name": "text/default",
        "var": "--text-secondary"
      },
      {
        "name": "text/disabled",
        "var": "--neutral-500"
      },
      {
        "name": "helper-text",
        "var": "--text-tertiary"
      },
      {
        "name": "error-message",
        "var": "--negative"
      },
      {
        "name": "icon/default",
        "var": "--neutral-1000"
      },
      {
        "name": "icon/disabled",
        "var": "--neutral-400"
      }
    ]
  },
  {
    "component": "footer",
    "tokens": [
      {
        "name": "background",
        "var": "--brand-300"
      },
      {
        "name": "iconNewsletter",
        "var": "--brand-400"
      },
      {
        "name": "title",
        "var": "--text-primary"
      },
      {
        "name": "text",
        "var": "--brand-1000"
      }
    ]
  },
  {
    "component": "infobox",
    "tokens": [
      {
        "name": "background",
        "var": "--brand-200"
      },
      {
        "name": "icon",
        "var": "--neutral-900"
      },
      {
        "name": "text",
        "var": "--neutral-900"
      },
      {
        "name": "description",
        "var": "--text-secondary"
      },
      {
        "name": "border",
        "var": "--brand-600"
      }
    ]
  },
  {
    "component": "input",
    "tokens": [
      {
        "name": "background/default",
        "var": "--neutral-100"
      },
      {
        "name": "background/hover",
        "var": "--neutral-200"
      },
      {
        "name": "background/press",
        "var": "--neutral-200"
      },
      {
        "name": "background/active",
        "var": "--brand-000"
      },
      {
        "name": "background/error",
        "var": "--neutral-100"
      },
      {
        "name": "background/disabled",
        "var": "--neutral-200"
      },
      {
        "name": "border/disabled",
        "var": "--neutral-200"
      },
      {
        "name": "border/default",
        "var": "--neutral-300"
      },
      {
        "name": "border/hover",
        "var": "--neutral-600"
      },
      {
        "name": "border/press",
        "var": "--neutral-900"
      },
      {
        "name": "border/active",
        "var": "--brand-primary"
      },
      {
        "name": "border/error",
        "var": "--negative"
      },
      {
        "name": "label/default",
        "var": "--neutral-1000"
      },
      {
        "name": "label/hover",
        "var": "--neutral-1000"
      },
      {
        "name": "label/press",
        "var": "--neutral-1000"
      },
      {
        "name": "label/active",
        "var": "--brand-primary"
      },
      {
        "name": "label/error",
        "var": "--negative"
      },
      {
        "name": "label/disabled",
        "var": "--neutral-1000"
      },
      {
        "name": "text/placeholder",
        "var": "--neutral-500"
      },
      {
        "name": "text/default",
        "var": "--text-secondary"
      },
      {
        "name": "text/disabled",
        "var": "--neutral-500"
      },
      {
        "name": "helper-text",
        "var": "--text-tertiary"
      },
      {
        "name": "error-message",
        "var": "--negative"
      },
      {
        "name": "icon/default",
        "var": "--neutral-1000"
      },
      {
        "name": "icon/disabled",
        "var": "--neutral-400"
      }
    ]
  },
  {
    "component": "list-item",
    "tokens": [
      {
        "name": "title",
        "var": "--brand-500"
      },
      {
        "name": "icon",
        "var": "--brand-500"
      },
      {
        "name": "subtitle",
        "var": "--text-primary"
      },
      {
        "name": "text",
        "var": "--text-primary"
      }
    ]
  },
  {
    "component": "main-menu",
    "tokens": [
      {
        "name": "background",
        "var": "--bg-primary"
      }
    ]
  },
  {
    "component": "radio-button",
    "tokens": [
      {
        "name": "background/default",
        "var": "--neutral-100"
      },
      {
        "name": "background/hover",
        "var": "--neutral-200"
      },
      {
        "name": "background/pressed",
        "var": "--neutral-400"
      },
      {
        "name": "background/selected",
        "var": "--brand-000"
      },
      {
        "name": "background/error",
        "var": "--neutral-100"
      },
      {
        "name": "border/default",
        "var": "--neutral-500"
      },
      {
        "name": "border/hover",
        "var": "--neutral-700"
      },
      {
        "name": "border/pressed",
        "var": "--neutral-800"
      },
      {
        "name": "border/selected",
        "var": "--brand-600"
      },
      {
        "name": "border/error",
        "var": "--negative"
      },
      {
        "name": "text/default",
        "var": "--neutral-800"
      },
      {
        "name": "text/hover",
        "var": "--neutral-800"
      },
      {
        "name": "text/pressed",
        "var": "--neutral-800"
      },
      {
        "name": "text/selected",
        "var": "--brand-600"
      },
      {
        "name": "error-message",
        "var": "--negative"
      }
    ]
  },
  {
    "component": "section-body",
    "tokens": [
      {
        "name": "title",
        "var": "--brand-700"
      },
      {
        "name": "lead",
        "var": "--brand-primary"
      },
      {
        "name": "category/icon",
        "var": "--brand-000"
      },
      {
        "name": "category/background",
        "var": "--brand-700"
      }
    ]
  },
  {
    "component": "tag",
    "tokens": [
      {
        "name": "border",
        "var": "--brand-200"
      },
      {
        "name": "text",
        "var": "--brand-800"
      }
    ]
  },
  {
    "component": "section-header",
    "tokens": [
      {
        "name": "iconBackground",
        "var": "--brand-000"
      },
      {
        "name": "iconBackground/video",
        "var": "--brand-500"
      },
      {
        "name": "iconBackground/default",
        "var": "--brand-500"
      },
      {
        "name": "icon/video",
        "var": "--brand-000"
      },
      {
        "name": "icon/default",
        "var": "--brand-500"
      },
      {
        "name": "title/video",
        "var": "--brand-000"
      },
      {
        "name": "title/default",
        "var": "--brand-500"
      },
      {
        "name": "lead/video",
        "var": "--brand-000"
      },
      {
        "name": "lead/default",
        "var": "--text-primary"
      },
      {
        "name": "description/default",
        "var": "--text-primary"
      }
    ]
  },
  {
    "component": "scroll",
    "tokens": [
      {
        "name": "background",
        "var": "--brand-400"
      }
    ]
  },
  {
    "component": "agendafilter",
    "tokens": [
      {
        "name": "background",
        "var": "--brand-000"
      },
      {
        "name": "text",
        "var": "--project-employability"
      },
      {
        "name": "icon",
        "var": "--project-employability"
      },
      {
        "name": "border",
        "var": "--project-employability"
      }
    ]
  },
  {
    "component": "chatbot",
    "tokens": [
      {
        "name": "background",
        "hex": "#F57600"
      },
      {
        "name": "icon",
        "var": "--brand-000"
      },
      {
        "name": "shadow",
        "var": "--neutral-400"
      }
    ]
  }
];
