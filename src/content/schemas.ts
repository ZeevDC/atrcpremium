import { z } from 'zod';
export const schemas = {
  pages: {
    home: z.object({
      "syncBanner": z.object({
        "message": z.string(),
        "ctaLabel": z.string()
      }),
      "footer": z.object({
        "text": z.string()
      }),
      "joinCta": z.object({
        "heading": z.string(),
        "subtext": z.string(),
        "buttonLabel": z.string()
      }),
      "comingSoon": z.object({
        "heading": z.string(),
        "subtext": z.string()
      })
    }),
    admin_allowed_emails: z.object({
      "pageTitle": z.string(),
      "pageDescription": z.string(),
      "adminBadge": z.string(),
      "heading": z.string(),
      "subheading": z.string(),
      "addButton": z.string(),
      "statsTotal": z.string(),
      "statsNotes": z.string(),
      "statsShowing": z.string(),
      "searchPlaceholder": z.string(),
      "colEmail": z.string(),
      "colAdded": z.string(),
      "colAddedBy": z.string(),
      "colNotes": z.string(),
      "colActions": z.string(),
      "loadingText": z.string(),
      "emptySearch": z.string(),
      "emptyList": z.string(),
      "footerNote": z.string(),
      "addModalTitle": z.string(),
      "addEmailLabel": z.string(),
      "addEmailPlaceholder": z.string(),
      "addNotesLabel": z.string(),
      "addNotesOptional": z.string(),
      "addNotesPlaceholder": z.string(),
      "addCancelButton": z.string(),
      "addSubmitButton": z.string(),
      "editModalTitle": z.string(),
      "editEmailLabel": z.string(),
      "editNotesLabel": z.string(),
      "editCancelButton": z.string(),
      "editSaveButton": z.string(),
      "deleteModalTitle": z.string(),
      "deleteConfirmPrefix": z.string(),
      "deleteConfirmSuffix": z.string(),
      "deleteCancelButton": z.string(),
      "deleteConfirmButton": z.string(),
      "networkError": z.string(),
      "fetchError": z.string()
    }),
    forgot_password: z.object({
      "kicker": z.string(),
      "heading": z.string(),
      "badge": z.string(),
      "tagline": z.string(),
      "marquee": z.array(z.string()),
      "steps": z.object({
        "email": z.object({
          "label": z.string(),
          "sub": z.string(),
          "desc": z.string(),
          "cta": z.string(),
          "ctaLoading": z.string()
        }),
        "otp": z.object({
          "label": z.string(),
          "sub": z.string(),
          "cta": z.string(),
          "resend": z.string()
        }),
        "newpassword": z.object({
          "label": z.string(),
          "sub": z.string(),
          "desc": z.string(),
          "cta": z.string(),
          "ctaLoading": z.string()
        }),
        "done": z.object({
          "label": z.string(),
          "sub": z.string(),
          "heading": z.string(),
          "desc": z.string(),
          "cta": z.string()
        })
      }),
      "fields": z.object({
        "email": z.string(),
        "emailPlaceholder": z.string(),
        "otpLabel": z.string(),
        "otpPlaceholder": z.string(),
        "otpHint": z.string(),
        "newPassword": z.string(),
        "newPasswordPlaceholder": z.string(),
        "confirmPassword": z.string(),
        "confirmPasswordPlaceholder": z.string()
      }),
      "footer": z.object({
        "text": z.string(),
        "link": z.string()
      })
    }),
    achievements: z.object({
      "TITLES": z.array(z.object({
        "level": z.number(),
        "name": z.string(),
        "emoji": z.string(),
        "days": z.number(),
        "unlocked": z.boolean(),
        "id": z.string()
      }))
    }),
    admin: z.object({
      "heading": z.string(),
      "tabs": z.object({
        "users": z.string(),
        "allowlist": z.string(),
        "materials": z.string(),
        "privacy": z.string(),
        "announcements": z.string(),
        "analytics": z.string(),
        "leaderboard": z.string(),
        "maintenance": z.string(),
        "backup": z.string()
      }),
      "users": z.object({
        "sectionTitle": z.string(),
        "searchPlaceholder": z.string(),
        "emptyState": z.string(),
        "tableHeaders": z.array(z.string())
      }),
      "allowlist": z.object({
        "sectionTitle": z.string(),
        "description": z.string(),
        "openButton": z.string()
      }),
      "materials": z.object({
        "sectionTitle": z.string(),
        "uploadButton": z.string(),
        "emptyState": z.string(),
        "emptySubtitle": z.string(),
        "modalTitle": z.string(),
        "modalEditTitle": z.string(),
        "namePlaceholder": z.string(),
        "cancelButton": z.string(),
        "saveButton": z.string(),
        "uploadSubmitButton": z.string(),
        "addLinkButton": z.string(),
        "subjectLabel": z.string(),
        "categoryLabel": z.string(),
        "watermarkLabel": z.string(),
        "publishedLabel": z.string(),
        "typeFile": z.string(),
        "typeLink": z.string(),
        "linkPlaceholder": z.string(),
        "linkLabel": z.string(),
        "subjects": z.array(z.object({
          "id": z.string(),
          "label": z.string()
        })),
        "categories": z.array(z.object({
          "id": z.string(),
          "label": z.string()
        }))
      }),
      "privacy": z.object({
        "sectionTitle": z.string(),
        "items": z.array(z.object({
          "id": z.string(),
          "label": z.string(),
          "desc": z.string()
        }))
      }),
      "announcements": z.object({
        "sectionTitle": z.string(),
        "newButton": z.string(),
        "emptyTitle": z.string(),
        "emptySubtitle": z.string(),
        "modalNewTitle": z.string(),
        "modalEditTitle": z.string(),
        "titlePlaceholder": z.string(),
        "bodyPlaceholder": z.string(),
        "pinLabel": z.string(),
        "publishLabel": z.string(),
        "draftLabel": z.string(),
        "saveButton": z.string(),
        "postButton": z.string(),
        "cancelButton": z.string()
      }),
      "analytics": z.object({
        "sectionTitle": z.string(),
        "emptyNote": z.string(),
        "stats": z.array(z.object({
          "id": z.string(),
          "label": z.string(),
          "emoji": z.string()
        })),
        "pmleTitle": z.string(),
        "pmleDescription": z.string(),
        "pmleDateLabel": z.string(),
        "pmleSaveButton": z.string(),
        "pmleClearButton": z.string(),
        "pmleSavedToast": z.string(),
        "pmleClearedToast": z.string(),
        "pmleErrorToast": z.string(),
        "pmleCurrentLabel": z.string(),
        "pmleNoneLabel": z.string(),
        "pmleLoadError": z.string()
      }),
      "leaderboard": z.object({
        "sectionTitle": z.string(),
        "resetButton": z.string(),
        "resetConfirm": z.string(),
        "resetToast": z.string(),
        "hideButton": z.string(),
        "emptyState": z.string()
      }),
      "maintenance": z.object({
        "sectionTitle": z.string(),
        "title": z.string(),
        "description": z.string(),
        "enableLabel": z.string(),
        "disableLabel": z.string(),
        "warningText": z.string()
      }),
      "backup": z.object({
        "sectionTitle": z.string(),
        "lastSyncedLabel": z.string(),
        "lastSyncedValue": z.string(),
        "notConnected": z.string(),
        "syncButton": z.string(),
        "syncToast": z.string(),
        "configButton": z.string(),
        "configToast": z.string(),
        "helpText": z.string()
      }),
      "accessDenied": z.object({
        "icon": z.string(),
        "title": z.string(),
        "description": z.string(),
        "homeButton": z.string()
      })
    }),
    learning_materials: z.object({
      "pageTitle": z.string(),
      "pageMetaDescription": z.string(),
      "heading": z.string(),
      "viewOnlyBadge": z.string(),
      "tabs": z.array(z.object({
        "id": z.string(),
        "label": z.string(),
        "emoji": z.string()
      })),
      "loadingEmoji": z.string(),
      "loadingText": z.string(),
      "emptyEmoji": z.string(),
      "emptyTitle": z.string(),
      "emptySubtitle": z.string(),
      "watermarkedLabel": z.string(),
      "signedUrlLabel": z.string(),
      "externalLinkLabel": z.string(),
      "viewButton": z.string(),
      "openButton": z.string(),
      "adminLinkLabel": z.string(),
      "consent": z.object({
        "sectionTitle": z.string(),
        "alertText": z.string(),
        "antiSharingTitle": z.string(),
        "antiSharingItems": z.array(z.string()),
        "rightsTitle": z.string(),
        "rightsItems": z.array(z.string()),
        "agreeButton": z.string()
      })
    }),
    expired_access: z.object({
      "contactLabel": z.string(),
      "contactEmail": z.string(),
      "dataPreservedNote": z.string(),
      "signOutButton": z.string(),
      "reasons": z.object({
        "expired": z.object({
          "emoji": z.string(),
          "title": z.string(),
          "body": z.string()
        }),
        "suspended": z.object({
          "emoji": z.string(),
          "title": z.string(),
          "body": z.string()
        }),
        "pending": z.object({
          "emoji": z.string(),
          "title": z.string(),
          "body": z.string()
        })
      })
    }),
    join: z.object({
      "hero": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "subheadline": z.string()
      }),
      "features": z.object({
        "label": z.string(),
        "items": z.array(z.object({
          "icon": z.string(),
          "title": z.string(),
          "description": z.string(),
          "id": z.string()
        }))
      }),
      "accessNote": z.string(),
      "form": z.object({
        "eyebrow": z.string(),
        "heading": z.string(),
        "submitLabel": z.string(),
        "loadingLabel": z.string(),
        "signInPrompt": z.string(),
        "signInLabel": z.string()
      })
    }),
    profile: z.object({
      "heading": z.string(),
      "sections": z.object({
        "idCard": z.string(),
        "credentials": z.string(),
        "notifications": z.string(),
        "chooseAvatar": z.string()
      })
    }),
    leaderboard: z.object({
      "pageTitle": z.string(),
      "pageDescription": z.string(),
      "heading": z.string(),
      "cardTitle": z.string(),
      "cardSubtitle": z.string(),
      "searchPlaceholder": z.string(),
      "loadingText": z.string(),
      "subjects": z.array(z.object({
        "id": z.string(),
        "label": z.string(),
        "weight": z.string()
      }))
    }),
    tos_tracker: z.object({
      "pageTitle": z.string(),
      "pageDescription": z.string(),
      "heading": z.string(),
      "overallCoverageLabel": z.string(),
      "itemsCoveredSuffix": z.string(),
      "loadingText": z.string()
    })
  }
};
export type Schemas = typeof schemas;