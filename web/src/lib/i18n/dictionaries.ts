import type { Locale } from "./types";

export type Dictionary = {
  meta: { title: string; description: string };
  nav: { pricing: string; demo: string; trial: string; login: string };
  hero: {
    headline: string;
    subhead: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trust: string;
  };
  howItWorks: { title: string; steps: string[] };
  builtForQuebec: { title: string; items: string[] };
  features: { title: string; items: { title: string; desc: string }[] };
  roi: { title: string; rows: { label: string; value: string }[]; punchline: string };
  waitlist: {
    title: string;
    subtitle: string;
    fields: {
      businessName: string;
      contactName: string;
      email: string;
      phone: string;
      city: string;
      staffCount: string;
      pain: string;
    };
    pains: { value: string; label: string }[];
    submit: string;
    success: string;
  };
  faq: { title: string; items: { q: string; a: string }[] };
  footer: { cta: string; rights: string; privacy: string; terms: string };
  pricing: {
    title: string;
    subtitle: string;
    monthly: string;
    annual: string;
    save: string;
    billedYearly: string;
    perMonth: string;
    popular: string;
    trialNote: string;
    cta: string;
    contact: string;
    faqTitle: string;
    taxNote: string;
    plans: {
      starter: { name: string; features: string[] };
      white_glove: { name: string; features: string[] };
    };
    billingFaq: { q: string; a: string }[];
  };
  signup: {
    title: string;
    subtitle: string;
    step1: string;
    fields: {
      email: string;
      password: string;
      businessName: string;
      city: string;
      phone: string;
      language: string;
    };
    langOptions: { fr: string; en: string };
    submit: string;
    success: string;
    hasAccount: string;
  };
  login: {
    title: string;
    subtitle: string;
    fields: { email: string; password: string };
    submit: string;
    registered: string;
    noAccount: string;
    configError: string;
  };
  legal: {
    back: string;
    updated: string;
    contact: string;
    privacy: { title: string; sections: { heading: string; paragraphs: string[] }[] };
    terms: { title: string; sections: { heading: string; paragraphs: string[] }[] };
  };
  dashboard: {
    title: string;
    subtitle: string;
    nav: {
      today: string;
      bookings: string;
      leads: string;
      customers: string;
      settings: string;
      calls: string;
      logout: string;
    };
    stats: {
      bookingsToday: string;
      activeLeads: string;
      recoveredCalls: string;
      voiceCallsToday: string;
      recoveredRevenue: string;
      noShowsToday: string;
    };
    calls: {
      title: string;
      empty: string;
      sms: string;
      unknownCaller: string;
      recovered: string;
      historySubtitle: string;
      showMore: string;
      showLess: string;
      outcomes: {
        booked: string;
        lead_captured: string;
        transferred: string;
        dropped: string;
        other: string;
      };
    };
    trial: { title: string; plan: string; ends: string };
    setupChecklist: {
      label: string;
      title: string;
      subtitle: string;
      bookLink: string;
      items: {
        services: string;
        hours: string;
        voice: string;
        greeting: string;
        bookPage: string;
      };
    };
    smsStatus: {
      pausedTitle: string;
      pausedBody: string;
      warnTitle: string;
      warnBody: string;
      usageLine: string;
      billingLink: string;
    };
    common: {
      delete: string;
      deleteConfirmBooking: string;
      deleteConfirmLead: string;
      deleteConfirmCall: string;
      deleteConfirmCustomer: string;
      deleteError: string;
    };
    settings: {
      subtitle: string;
      business: string;
      email: string;
      plan: string;
      language: string;
      billingNote: string;
      profileTitle: string;
      profileSubtitle: string;
      businessName: string;
      city: string;
      industry: string;
      industryPlaceholder: string;
      forwardTo: string;
      forwardToPlaceholder: string;
      save: string;
      saving: string;
      saved: string;
      saveError: string;
      removeService: string;
    };
    voice: {
      title: string;
      subtitle: string;
      status: string;
      statusReady: string;
      statusPending: string;
      line: string;
      agentId: string;
      sharedLineNote: string;
      syncCta: string;
      syncing: string;
      syncDone: string;
      syncError: string;
      customTitle: string;
      customSubtitle: string;
      greetingLabel: string;
      greetingHint: string;
      instructionsLabel: string;
      instructionsPlaceholder: string;
      instructionsHint: string;
      saveCustom: string;
      saving: string;
      customSaved: string;
      saveError: string;
    };
    bookings: {
      add: string;
      customerName: string;
      phone: string;
      serviceOptional: string;
      staffOptional: string;
      notes: string;
      save: string;
      cancel: string;
      empty: string;
      error: string;
      sendSms: string;
      smsSent: string;
      smsError: string;
      noPhone: string;
      sendReminder: string;
      filterUpcoming: string;
      filterPast: string;
      filterAll: string;
      statuses: {
        booked: string;
        confirmed: string;
        cancelled: string;
        noShow: string;
        completed: string;
      };
      edit: string;
      saveEdit: string;
      cancelEdit: string;
    };
    leads: {
      add: string;
      name: string;
      phone: string;
      notes: string;
      save: string;
      saveNotes: string;
      savingNotes: string;
      bookCta: string;
      bookHint: string;
      empty: string;
      error: string;
      sources: { manual: string; missedCall: string; webForm: string; sms: string };
      stages: { new: string; contacted: string; booked: string; lost: string };
    };
    customers: {
      subtitle: string;
      empty: string;
      phone: string;
      email: string;
      added: string;
      save: string;
      saving: string;
    };
    staff: {
      title: string;
      subtitle: string;
      empty: string;
      namePlaceholder: string;
      add: string;
      remove: string;
      error: string;
    };
    embed: {
      title: string;
      subtitle: string;
      bookingPage: string;
      embedCode: string;
      copy: string;
      copyEmbed: string;
      copied: string;
      iframeTitle: string;
    };
    embedForm: {
      name: string;
      phone: string;
      notes: string;
      submit: string;
      success: string;
      error: string;
    };
    publicBook: {
      title: string;
      name: string;
      phone: string;
      email: string;
      service: string;
      date: string;
      time: string;
      notes: string;
      submit: string;
      success: string;
      error: string;
      noSlots: string;
      pickService: string;
    };
    billing: {
      title: string;
      subtitle: string;
      notConfigured: string;
      currentPlan: string;
      trialEnds: string;
      nextBilling: string;
      status: string;
      statuses: Record<string, string>;
      checkoutCanceled: string;
      pastDue: string;
      trialBanner: string;
      monthly: string;
      annual: string;
      manageBilling: string;
      subscribe: string;
      error: string;
      successTitle: string;
      successBody: string;
      backToSettings: string;
      usageTitle: string;
      usageBookings: string;
      usageSms: string;
      usageVoice: string;
      usageStaff: string;
      unlimited: string;
      usageWarn: string;
      usageCritical: string;
      usageMeterWarn: string;
      usageMeterCritical: string;
    };
  };
  onboarding: {
    title: string;
    subtitle: string;
    step: string;
    next: string;
    error: string;
    days: Record<string, string>;
    hours: { title: string; subtitle: string };
    services: {
      title: string;
      subtitle: string;
      name: string;
      duration: string;
      price: string;
      add: string;
    };
    done: { title: string; subtitle: string; cta: string };
    businessTypes: {
      title: string;
      subtitle: string;
      salon: string;
      salonDesc: string;
      trade: string;
      tradeDesc: string;
      office: string;
      officeDesc: string;
    };
  };
  verticals: {
    label: string;
    title: string;
    subtitle: string;
    items: { title: string; desc: string; examples: string[] }[];
  };
};

const fr: Dictionary = {
  meta: {
    title: "JustBookMe — Ne perdez plus aucun rendez-vous",
    description:
      "Réceptionniste IA bilingue pour salons de luxe, spas médicaux et cliniques. Appels manqués, réservations et rappels SMS — partout au Canada.",
  },
  nav: {
    pricing: "Tarification",
    demo: "Réserver une démo",
    trial: "Essai gratuit",
    login: "Connexion",
  },
  hero: {
    headline: "Le concierge IA premium pour salons et cliniques de luxe.",
    subhead:
      "JustBookMe répond à vos appels 24 h/24 avec une IA bilingue au ton raffiné. Rehaussez l'image de votre marque et réservez vos clients haut de gamme instantanément.",
    ctaPrimary: "Essayer gratuitement",
    ctaSecondary: "Réserver une démo de 15 minutes",
    trust: "Conçu au Québec · Bilingue · Essai 14 jours sans carte",
  },
  howItWorks: {
    title: "Comment ça fonctionne",
    steps: [
      "On connecte votre numéro existant ou on vous en attribue un nouveau.",
      "Votre réceptionniste IA répond, réserve et confirme — bilingue.",
      "Vous consultez chaque matin votre tableau de bord des revenus récupérés.",
    ],
  },
  builtForQuebec: {
    title: "Conçu pour le Québec",
    items: [
      "Bilingue FR/EN avec une voix naturelle",
      "Prix en CAD, facturation TPS/TVQ",
      "Conforme à la Loi 25",
      "Soutien local, heures d'affaires EST/EDT",
    ],
  },
  features: {
    title: "Votre réceptionniste IA, 24/7",
    items: [
      {
        title: "Répond aux appels manqués",
        desc: "L'IA décroche, qualifie le client et propose des créneaux disponibles.",
      },
      {
        title: "Prend les rendez-vous",
        desc: "Réservation, report ou annulation — synchronisé avec votre calendrier.",
      },
      {
        title: "Rappels SMS automatiques",
        desc: "Confirmation, rappel 24h et 2h — en français ou en anglais.",
      },
      {
        title: "Pipeline de leads",
        desc: "Chaque appel et formulaire web dans une timeline claire.",
      },
      {
        title: "Tableau de bord quotidien",
        desc: "Rendez-vous, no-shows et appels récupérés en un coup d'œil.",
      },
    ],
  },
  roi: {
    title: "Combien vous coûte un appel manqué à 22h?",
    rows: [
      { label: "5 appels manqués / semaine × 500 $ (Soins)", value: "10 000 $/mois" },
      { label: "4 no-shows / semaine × 150 $ (Dépôts perdus)", value: "2 400 $/mois" },
      { label: "JustBookMe Concierge", value: "399 $/mois" },
    ],
    punchline: "Un seul appel récupéré par mois paie l'abonnement.",
  },
  waitlist: {
    title: "Rejoignez la liste d'attente",
    subtitle:
      "Soyez parmi les 10 premiers salons et barbershops au Québec à tester JustBookMe. Tarif fondateur garanti à vie.",
    fields: {
      businessName: "Nom du salon",
      contactName: "Votre nom",
      email: "Courriel",
      phone: "Téléphone",
      city: "Ville",
      staffCount: "Nombre d'employés",
      pain: "Principal défi",
    },
    pains: [
      { value: "missed_calls", label: "Appels manqués" },
      { value: "no_shows", label: "No-shows" },
      { value: "scheduling", label: "Planification" },
      { value: "web_leads", label: "Leads web" },
    ],
    submit: "Réserver ma place",
    success: "Merci! On vous contacte dans 48h pour une démo personnalisée.",
  },
  faq: {
    title: "Questions fréquentes",
    items: [
      {
        q: "Est-ce que ça ressemble à un robot?",
        a: "Non — voix naturelle entraînée sur des conversations réelles. Appelez notre ligne démo pour juger.",
      },
      {
        q: "Et si l'appelant veut parler à un humain?",
        a: "Transfert immédiat ou message pris — sans friction.",
      },
      {
        q: "Compatible avec mon agenda?",
        a: "Oui — Google Calendar et iCal dès le jour 1.",
      },
      {
        q: "Mes données sont-elles sécurisées?",
        a: "Hébergées au Canada, conformes à la Loi 25.",
      },
      {
        q: "Puis-je personnaliser les scripts?",
        a: "Oui — chaque prompt et modèle SMS est modifiable.",
      },
    ],
  },
  footer: {
    cta: "Prêt à ne plus perdre de clients?",
    rights: "JustBookMe · Montréal, QC",
    privacy: "Confidentialité",
    terms: "Conditions",
  },
  pricing: {
    title: "Tarification simple",
    subtitle:
      "Pour les entreprises de services au Québec. Essai gratuit de 14 jours. Annulation en tout temps.",
    monthly: "Mensuel",
    annual: "Annuel",
    save: "Économisez 17 %",
    billedYearly: "facturé",
    perMonth: "/mois",
    popular: "Le plus populaire",
    trialNote:
      "Aucune carte de crédit requise pour commencer. Ajoutez un paiement en tout temps pendant l'essai.",
    cta: "Commencer l'essai gratuit",
    contact: "Nous contacter",
    faqTitle: "Facturation",
    taxNote:
      "Les prix affichés n'incluent pas les taxes applicables. TPS/TVQ calculées à la caisse.",
    plans: {
      starter: {
        name: "Starter (DIY)",
        features: [
          "Créez votre propre IA",
          "500 SMS / mois",
          "200 min voix / mois",
          "Widget web + agenda",
        ],
      },
      white_glove: {
        name: "Clé en Main",
        features: [
          "Tout du forfait Starter",
          "Création de votre IA sur mesure",
          "Configuration des lignes téléphoniques",
          "100% Géré pour vous (Soutien VIP)",
          "+$149 Frais de configuration initiaux",
        ],
      },
    },
    billingFaq: [
      {
        q: "Faut-il une carte pour l'essai?",
        a: "Non. Inscrivez-vous par courriel, utilisez le forfait Pro pendant 14 jours.",
      },
      {
        q: "Puis-je changer de forfait?",
        a: "Oui — mise à niveau ou rétrogradation en tout temps, au prorata.",
      },
      {
        q: "Les taxes sont-elles incluses?",
        a: "Non — TPS/TVQ calculées à la caisse via Stripe.",
      },
    ],
  },
  signup: {
    title: "Commencez votre essai gratuit",
    subtitle: "14 jours du forfait Pro. Aucune carte requise.",
    step1: "Créez votre compte",
    fields: {
      email: "Courriel",
      password: "Mot de passe",
      businessName: "Nom de l'entreprise",
      city: "Ville",
      phone: "Téléphone",
      language: "Langue par défaut",
    },
    langOptions: { fr: "Français", en: "English" },
    submit: "Créer mon compte",
    success: "Compte créé! Connectez-vous pour configurer votre salon.",
    hasAccount: "Déjà un compte?",
  },
  login: {
    title: "Connexion",
    subtitle: "Accédez à votre tableau de bord JustBookMe.",
    fields: { email: "Courriel", password: "Mot de passe" },
    submit: "Se connecter",
    registered: "Compte créé! Connectez-vous pour continuer.",
    noAccount: "Pas encore de compte?",
    configError: "Connexion indisponible — configuration serveur manquante.",
  },
  legal: {
    back: "Retour à l'accueil",
    updated: "Dernière mise à jour",
    contact: "Questions",
    privacy: {
      title: "Politique de confidentialité",
      sections: [
        {
          heading: "Responsable",
          paragraphs: [
            "JustBookMe (« nous ») exploite justbookme.ca et les services associés pour les salons et entreprises de services au Québec.",
          ],
        },
        {
          heading: "Données collectées",
          paragraphs: [
            "Nous collectons les renseignements que vous fournissez (nom, courriel, téléphone, nom d'entreprise) via la liste d'attente, l'inscription et le tableau de bord.",
            "Les données d'utilisation (rendez-vous, leads, journaux d'appels) sont stockées pour fournir le service.",
          ],
        },
        {
          heading: "Hébergement et sécurité",
          paragraphs: [
            "Les données sont hébergées sur Supabase (infrastructure cloud). Nous appliquons le contrôle d'accès par entreprise (RLS) et le chiffrement en transit.",
          ],
        },
        {
          heading: "Vos droits (Loi 25)",
          paragraphs: [
            "Vous pouvez demander l'accès, la rectification ou la suppression de vos renseignements personnels en écrivant à info@justbookme.ca.",
          ],
        },
      ],
    },
    terms: {
      title: "Conditions d'utilisation",
      sections: [
        {
          heading: "Service",
          paragraphs: [
            "JustBookMe fournit une réceptionniste IA et des outils de réservation pour les entreprises de services. Les fonctionnalités peuvent évoluer pendant la phase pilote.",
          ],
        },
        {
          heading: "Essai gratuit",
          paragraphs: [
            "L'essai de 14 jours est offert sans carte de crédit. À la fin de l'essai, l'accès peut être suspendu sans paiement.",
          ],
        },
        {
          heading: "Utilisation acceptable",
          paragraphs: [
            "Vous êtes responsable du contenu des messages envoyés à vos clients et du respect des lois applicables (TPS/TVQ, Loi 25, CASL pour les SMS).",
          ],
        },
        {
          heading: "Annulation",
          paragraphs: [
            "Vous pouvez annuler en tout temps. Les données peuvent être exportées sur demande avant la fermeture du compte.",
          ],
        },
      ],
    },
  },
  dashboard: {
    title: "Aujourd'hui",
    subtitle: "Vue d'ensemble de votre activité.",
    nav: {
      today: "Aujourd'hui",
      bookings: "Rendez-vous",
      leads: "Leads",
      customers: "Clients",
      settings: "Paramètres",
      calls: "Appels",
      logout: "Déconnexion",
    },
    stats: {
      bookingsToday: "Rendez-vous aujourd'hui",
      activeLeads: "Leads actifs",
      recoveredCalls: "Réservations par IA",
      voiceCallsToday: "Appels et SMS",
      recoveredRevenue: "Revenu récupéré",
      noShowsToday: "Absences aujourd'hui",
    },
    calls: {
      title: "Activité d'aujourd'hui",
      empty: "Aucun appel ou SMS pour le moment.",
      sms: "SMS",
      unknownCaller: "Numéro inconnu",
      recovered: "Récupéré",
      historySubtitle: "Historique des appels et SMS.",
      showMore: "Voir plus",
      showLess: "Réduire",
      outcomes: {
        booked: "Réservé",
        lead_captured: "Lead capturé",
        transferred: "Transféré",
        dropped: "Manqué",
        other: "Autre",
      },
    },
    trial: { title: "Votre essai", plan: "Forfait", ends: "Se termine le" },
    setupChecklist: {
      label: "Mise en service",
      title: "Préparez votre réceptionniste IA",
      subtitle: "Complétez ces étapes avant d'accueillir vos premiers appels.",
      bookLink: "Page de réservation publique :",
      items: {
        services: "Ajouter vos services",
        hours: "Configurer vos heures d'ouverture",
        voice: "Activer l'agent vocal (synchroniser)",
        greeting: "Personnaliser le message d'accueil",
        bookPage: "Publier votre lien de réservation",
      },
    },
    smsStatus: {
      pausedTitle: "SMS automatiques en pause",
      pausedBody:
        "Les confirmations et rappels SMS sont temporairement suspendus — votre ligne téléphonique et les SMS entrants fonctionnent toujours.",
      warnTitle: "Limite SMS presque atteinte",
      warnBody:
        "Vous approchez de la limite d'envoi SMS de votre forfait. Passez au forfait Pro si vous avez besoin de plus de capacité.",
      usageLine: "Utilisation : {used} / {limit} SMS ce mois-ci",
      billingLink: "Voir la facturation →",
    },
    common: {
      delete: "Supprimer",
      deleteConfirmBooking: "Supprimer ce rendez-vous? Cette action est irréversible.",
      deleteConfirmLead: "Supprimer ce lead? Cette action est irréversible.",
      deleteConfirmCall: "Supprimer cette activité? Cette action est irréversible.",
      deleteConfirmCustomer: "Supprimer ce client? Cette action est irréversible.",
      deleteError: "Échec de la suppression — réessayez.",
    },
    settings: {
      subtitle: "Informations de votre compte.",
      business: "Entreprise",
      email: "Courriel",
      plan: "Forfait",
      language: "Langue",
      billingNote: "La facturation Stripe sera disponible lors de l'activation complète du forfait.",
      profileTitle: "Profil de l'entreprise",
      profileSubtitle: "Modifiez vos infos — l'agent vocal se synchronise automatiquement.",
      businessName: "Nom de l'entreprise",
      city: "Ville",
      industry: "Industrie / Spécialité",
      industryPlaceholder: "ex. Salon de coiffure, Plombier, Clinique dentaire",
      forwardTo: "Transfert vers (optionnel)",
      forwardToPlaceholder: "+1 514 555 1234",
      save: "Enregistrer et synchroniser",
      saving: "Enregistrement…",
      saved: "Enregistré — agent vocal mis à jour.",
      saveError: "Erreur — réessayez.",
      removeService: "Retirer le service",
    },
    voice: {
      title: "Réceptionniste IA",
      subtitle: "Votre agent vocal est créé automatiquement à partir de vos services et heures.",
      status: "Statut",
      statusReady: "Actif",
      statusPending: "En attente — terminez l'onboarding ou synchronisez",
      line: "Ligne",
      agentId: "Agent Vapi",
      sharedLineNote:
        "En essai, la ligne partagée pointe vers le dernier agent synchronisé. Chaque salon reçoit son propre agent vocal.",
      syncCta: "Synchroniser l'agent vocal",
      syncing: "Synchronisation…",
      syncDone: "Agent vocal mis à jour avec vos infos actuelles.",
      syncError: "Échec de la synchronisation — réessayez.",
      customTitle: "Personnaliser ce que dit l'IA",
      customSubtitle:
        "Dites à votre IA exactement comment parler à vos clients.",
      greetingLabel: "Comment l'IA doit-elle répondre au téléphone?",
      greetingHint: "Exemple: 'Bonjour! Merci d'appeler la Clinique. Comment puis-je vous aider?'",
      instructionsLabel: "Règles à suivre par l'IA",
      instructionsPlaceholder:
        "Écrivez des règles simples ici. Par exemple: 'Demander s'ils sont déjà venus' ou 'Nous acceptons seulement l'argent comptant'.",
      instructionsHint: "Écrivez ce que vous voulez que l'IA sache, dans vos propres mots.",
      saveCustom: "Enregistrer et synchroniser",
      saving: "Enregistrement…",
      customSaved: "Personnalisation enregistrée — agent vocal mis à jour.",
      saveError: "Erreur — réessayez.",
    },
    bookings: {
      add: "Nouveau rendez-vous",
      customerName: "Nom du client",
      phone: "Téléphone",
      serviceOptional: "Service (optionnel)",
      staffOptional: "Employé (optionnel)",
      notes: "Notes",
      save: "Enregistrer",
      cancel: "Annuler",
      empty: "Aucun rendez-vous pour le moment.",
      error: "Erreur — réessayez.",
      sendSms: "SMS",
      smsSent: "SMS envoyé",
      smsError: "Échec SMS",
      noPhone: "Pas de téléphone",
      sendReminder: "Rappel",
      filterUpcoming: "À venir",
      filterPast: "Passés",
      filterAll: "Tous",
      statuses: {
        booked: "Réservé",
        confirmed: "Confirmé",
        cancelled: "Annulé",
        noShow: "Absent",
        completed: "Terminé",
      },
      edit: "Modifier",
      saveEdit: "Enregistrer",
      cancelEdit: "Annuler",
    },
    leads: {
      add: "Nouveau lead",
      name: "Nom",
      phone: "Téléphone",
      notes: "Notes",
      save: "Enregistrer",
      saveNotes: "Enregistrer les notes",
      savingNotes: "Enregistrement…",
      bookCta: "Réserver",
      bookHint: "Créez un rendez-vous — le lead passera à « Réservé ».",
      empty: "Aucun lead pour le moment.",
      error: "Erreur — réessayez.",
      sources: { manual: "Manuel", missedCall: "Appel manqué", webForm: "Formulaire web", sms: "SMS" },
      stages: { new: "Nouveau", contacted: "Contacté", booked: "Réservé", lost: "Perdu" },
    },
    customers: {
      subtitle: "Clients créés automatiquement lors des réservations.",
      empty: "Aucun client pour le moment.",
      phone: "Téléphone",
      email: "Courriel",
      added: "Ajouté le",
      save: "Enregistrer",
      saving: "Enregistrement…",
    },
    staff: {
      title: "Équipe",
      subtitle: "Ajoutez des employés pour les associer aux rendez-vous.",
      empty: "Aucun employé — ajoutez le premier ci-dessous.",
      namePlaceholder: "Nom affiché",
      add: "Ajouter",
      remove: "Retirer",
      error: "Erreur — réessayez.",
    },
    embed: {
      title: "Widget web",
      subtitle: "Partagez votre page de réservation ou intégrez le formulaire de contact.",
      bookingPage: "Page de réservation publique",
      embedCode: "Code d'intégration (iframe)",
      copy: "Copier le lien",
      copyEmbed: "Copier le code",
      copied: "Copié!",
      iframeTitle: "Contactez-nous",
    },
    embedForm: {
      name: "Votre nom",
      phone: "Téléphone",
      notes: "Message (optionnel)",
      submit: "Envoyer",
      success: "Merci! Nous vous contacterons bientôt.",
      error: "Erreur — réessayez.",
    },
    publicBook: {
      title: "Réserver en ligne",
      name: "Votre nom",
      phone: "Téléphone",
      email: "Courriel (optionnel)",
      service: "Choisir un service",
      date: "Date",
      time: "Heure",
      notes: "Notes (optionnel)",
      submit: "Confirmer la réservation",
      success: "Réservation confirmée! Vous recevrez une confirmation par SMS si un numéro a été fourni.",
      error: "Impossible de réserver — choisissez un autre créneau.",
      noSlots: "Aucun créneau disponible ce jour.",
      pickService: "Aucun service disponible pour le moment.",
    },
    billing: {
      title: "Facturation",
      subtitle: "Gérez votre forfait et vos paiements.",
      notConfigured: "La facturation n'est pas encore activée sur ce site.",
      currentPlan: "Forfait actuel",
      trialEnds: "Fin de l'essai",
      nextBilling: "Prochaine facturation",
      status: "Statut",
      statuses: {
        trialing: "Essai",
        active: "Actif",
        past_due: "Paiement en retard",
        canceled: "Annulé",
        unpaid: "Impayé",
      },
      checkoutCanceled: "Paiement annulé — vous pouvez réessayer quand vous voulez.",
      pastDue: "Votre paiement a échoué. Mettez à jour votre carte pour éviter une interruption.",
      trialBanner: "Ajoutez un mode de paiement avant la fin de l'essai pour conserver l'accès.",
      monthly: "Mensuel",
      annual: "Annuel",
      manageBilling: "Gérer la facturation",
      subscribe: "S'abonner",
      error: "Erreur — réessayez ou contactez le support.",
      successTitle: "Paiement configuré",
      successBody: "Merci! Votre abonnement est en cours d'activation.",
      backToSettings: "Retour aux paramètres",
      usageTitle: "Utilisation ce mois-ci",
      usageBookings: "Réservations",
      usageSms: "SMS",
      usageVoice: "Minutes voix",
      usageStaff: "Employés actifs",
      unlimited: "Illimité",
      usageWarn:
        "Vous approchez de la limite de votre forfait ce mois-ci. Passez à un forfait supérieur si besoin.",
      usageCritical:
        "Limite de forfait atteinte ou dépassée. Les appels entrants continuent — surveillez l'utilisation ou passez au forfait Pro.",
      usageMeterWarn: "Presque à la limite",
      usageMeterCritical: "Limite atteinte",
    },
  },
  onboarding: {
    title: "Formulaire d'admission premium",
    subtitle: "Parlez-nous de vos services. Notre équipe configurera votre concierge IA sur mesure.",
    step: "Étape",
    next: "Continuer",
    error: "Erreur — réessayez.",
    days: {
      mon: "Lun",
      tue: "Mar",
      wed: "Mer",
      thu: "Jeu",
      fri: "Ven",
      sat: "Sam",
      sun: "Dim",
    },
    hours: {
      title: "Heures d'ouverture",
      subtitle: "Utilisées pour proposer des créneaux aux clients.",
    },
    services: {
      title: "Vos services",
      subtitle: "Ajoutez au moins un service proposé à vos clients.",
      name: "Nom",
      duration: "Durée (min)",
      price: "Prix ($)",
      add: "Ajouter un service",
    },
    done: {
      title: "Admission soumise avec succès",
      subtitle:
        "Nous configurons actuellement votre concierge IA de luxe. Vous pouvez accéder à votre tableau de bord en attendant.",
      cta: "Accéder à mon tableau de bord",
    },
    businessTypes: {
      title: "Type d'établissement",
      subtitle: "Nous adapterons votre IA de luxe à votre spécialité.",
      salon: "Salon de luxe ou spa",
      salonDesc: "Coiffure haut de gamme, esthétique, bien-être.",
      trade: "Clinique esthétique",
      tradeDesc: "Soins spécialisés, clinique privée.",
      office: "Bureau professionnel",
      officeDesc: "Consultations haut de gamme.",
    },
  },
  verticals: {
    label: "Pour qui",
    title: "Conçu pour votre type d'entreprise",
    subtitle:
      "Le même réceptionniste IA — adapté aux salons de luxe, spas médicaux et cliniques.",
    items: [
      {
        title: "Salons & Barbershops de luxe",
        desc: "L'IA comprend « je veux un balayage » ou « un fade », propose des créneaux et envoie des rappels.",
        examples: ["Coupe & coloration", "Fade & barbe", "Extensions"],
      },
      {
        title: "Spas médicaux",
        desc: "Automatisez les consultations pour injections et laser avec un concierge numérique raffiné.",
        examples: ["Injections", "Épilation au laser", "Consultations"],
      },
      {
        title: "Cliniques d'esthétique",
        desc: "Une expérience de réservation haut de gamme pour vos soins spécialisés.",
        examples: ["Évaluation de la peau", "Soins du visage", "Nouveaux patients"],
      },
    ],
  },
};

const en: Dictionary = {
  meta: {
    title: "JustBookMe — Never miss a booking again",
    description:
      "Bilingual AI receptionist for luxury salons, med spas & high-end clinics. Missed calls, bookings, and SMS reminders — book me, simply.",
  },
  nav: {
    pricing: "Pricing",
    demo: "Book a demo",
    trial: "Start free trial",
    login: "Log in",
  },
  hero: {
    headline: "The premium AI concierge for luxury salons and clinics.",
    subhead:
      "JustBookMe answers your phone 24/7 with a polished, bilingual AI. Elevate your brand, book high-ticket clients instantly, and never miss a call again.",
    ctaPrimary: "Start free trial",
    ctaSecondary: "Book a 15-minute demo",
    trust: "Built in Quebec · Bilingual · 14-day trial, no card",
  },
  howItWorks: {
    title: "How it works",
    steps: [
      "We connect to your existing phone number or give you a new one.",
      "Your AI receptionist answers, books, and confirms — bilingually.",
      "You check your recovered-revenue dashboard every morning.",
    ],
  },
  builtForQuebec: {
    title: "Built for Quebec",
    items: [
      "Bilingual FR/EN with native-quality voice",
      "CAD pricing, PST/QST invoicing",
      "Compliant with Quebec privacy law (Law 25)",
      "Local support, business hours in EST/EDT",
    ],
  },
  features: {
    title: "Your AI receptionist, 24/7",
    items: [
      {
        title: "Answers missed calls",
        desc: "AI picks up, qualifies the client, and offers open slots.",
      },
      {
        title: "Books appointments",
        desc: "Book, reschedule, or cancel — synced to your calendar.",
      },
      {
        title: "Automatic SMS reminders",
        desc: "Confirmation, 24h and 2h reminders — French or English.",
      },
      {
        title: "Lead pipeline",
        desc: "Every call and web form in one clear timeline.",
      },
      {
        title: "Daily dashboard",
        desc: "Bookings, no-shows, and recovered calls at a glance.",
      },
    ],
  },
  roi: {
    title: "What does a missed 10 PM call cost you?",
    rows: [
      { label: "5 missed calls/week × $500 (Treatments)", value: "$10,000/month" },
      { label: "4 no-shows/week × $150 (Lost deposits)", value: "$2,400/month" },
      { label: "JustBookMe Concierge", value: "$399/month" },
    ],
    punchline: "Recover a single $500 appointment per month and the service pays for itself.",
  },
  waitlist: {
    title: "Join the waitlist",
    subtitle:
      "Be among the first 10 Quebec salons & barbershops to try JustBookMe. Founder pricing locked for life.",
    fields: {
      businessName: "Business name",
      contactName: "Your name",
      email: "Email",
      phone: "Phone",
      city: "City",
      staffCount: "Staff count",
      pain: "Biggest challenge",
    },
    pains: [
      { value: "missed_calls", label: "Missed calls" },
      { value: "no_shows", label: "No-shows" },
      { value: "scheduling", label: "Scheduling" },
      { value: "web_leads", label: "Web leads" },
    ],
    submit: "Save my spot",
    success: "Thanks! We'll reach out within 48 hours for a personalized demo.",
  },
  faq: {
    title: "Frequently asked questions",
    items: [
      {
        q: "Does it sound like a robot?",
        a: "No — natural voice trained on real conversations. Call our demo line to hear it.",
      },
      {
        q: "What if the caller wants a human?",
        a: "Instant transfer or message taken — no friction.",
      },
      {
        q: "Will it integrate with my calendar?",
        a: "Yes — Google Calendar and iCal on day one.",
      },
      {
        q: "Is my data safe?",
        a: "Hosted in Canada, compliant with Law 25.",
      },
      {
        q: "Can I customize the scripts?",
        a: "Yes — every prompt and SMS template is editable.",
      },
    ],
  },
  footer: {
    cta: "Ready to stop losing clients?",
    rights: "JustBookMe · Montreal, QC",
    privacy: "Privacy",
    terms: "Terms",
  },
  pricing: {
    title: "Simple pricing",
    subtitle:
      "For Quebec service businesses. 14-day free trial. Cancel anytime.",
    monthly: "Monthly",
    annual: "Annual",
    save: "Save 17%",
    billedYearly: "billed",
    perMonth: "/mo",
    popular: "Most popular",
    trialNote:
      "No credit card required to start. Add payment anytime during your trial.",
    cta: "Start free trial",
    contact: "Contact us",
    faqTitle: "Billing",
    taxNote:
      "Prices shown exclude applicable taxes. PST/QST calculated at checkout.",
    plans: {
      starter: {
        name: "Starter (DIY)",
        features: [
          "Build your own AI",
          "500 SMS / month",
          "200 voice min / month",
          "Web widget + calendar",
        ],
      },
      white_glove: {
        name: "White-Glove AI",
        features: [
          "Everything in Starter",
          "Custom AI built by us",
          "We handle phone porting",
          "100% Done-for-you VIP support",
          "+$149 one-time setup fee",
        ],
      },
    },
    billingFaq: [
      {
        q: "Do I need a card for the trial?",
        a: "No. Sign up with email, use Pro features for 14 days.",
      },
      {
        q: "Can I switch plans?",
        a: "Yes — upgrade or downgrade anytime, prorated automatically.",
      },
      {
        q: "Are taxes included?",
        a: "No — PST/QST calculated at checkout via Stripe.",
      },
    ],
  },
  signup: {
    title: "Start your free trial",
    subtitle: "14 days of Pro. No card required.",
    step1: "Create your account",
    fields: {
      email: "Email",
      password: "Password",
      businessName: "Business name",
      city: "City",
      phone: "Phone",
      language: "Default language",
    },
    langOptions: { fr: "Français", en: "English" },
    submit: "Create account",
    success: "Account created! Sign in to set up your business.",
    hasAccount: "Already have an account?",
  },
  login: {
    title: "Log in",
    subtitle: "Access your JustBookMe dashboard.",
    fields: { email: "Email", password: "Password" },
    submit: "Log in",
    registered: "Account created! Sign in to continue.",
    noAccount: "Don't have an account?",
    configError: "Login unavailable — server not configured.",
  },
  legal: {
    back: "Back to home",
    updated: "Last updated",
    contact: "Questions",
    privacy: {
      title: "Privacy Policy",
      sections: [
        {
          heading: "Data controller",
          paragraphs: [
            "JustBookMe (« we ») operates justbookme.ca and related services for Quebec service businesses.",
          ],
        },
        {
          heading: "Data we collect",
          paragraphs: [
            "We collect information you provide (name, email, phone, business name) via waitlist, signup, and the dashboard.",
            "Usage data (bookings, leads, call logs) is stored to deliver the service.",
          ],
        },
        {
          heading: "Hosting and security",
          paragraphs: [
            "Data is hosted on Supabase (cloud infrastructure). We use per-business access control (RLS) and encryption in transit.",
          ],
        },
        {
          heading: "Your rights (Law 25)",
          paragraphs: [
            "You may request access, correction, or deletion of your personal information by emailing info@justbookme.ca.",
          ],
        },
      ],
    },
    terms: {
      title: "Terms of Service",
      sections: [
        {
          heading: "Service",
          paragraphs: [
            "JustBookMe provides an AI receptionist and booking tools for service businesses. Features may evolve during the pilot phase.",
          ],
        },
        {
          heading: "Free trial",
          paragraphs: [
            "A 14-day trial is offered without a credit card. After the trial, access may be suspended without payment.",
          ],
        },
        {
          heading: "Acceptable use",
          paragraphs: [
            "You are responsible for message content sent to your customers and compliance with applicable laws (PST/QST, Law 25, CASL for SMS).",
          ],
        },
        {
          heading: "Cancellation",
          paragraphs: [
            "You may cancel anytime. Data may be exported on request before account closure.",
          ],
        },
      ],
    },
  },
  dashboard: {
    title: "Today",
    subtitle: "Overview of your business activity.",
    nav: {
      today: "Today",
      bookings: "Bookings",
      leads: "Leads",
      customers: "Customers",
      settings: "Settings",
      calls: "Calls",
      logout: "Log out",
    },
    stats: {
      bookingsToday: "Bookings today",
      activeLeads: "Active leads",
      recoveredCalls: "AI bookings",
      voiceCallsToday: "Calls & texts",
      recoveredRevenue: "Recovered revenue",
      noShowsToday: "No-shows today",
    },
    calls: {
      title: "Today's activity",
      empty: "No calls or texts yet.",
      sms: "SMS",
      unknownCaller: "Unknown number",
      recovered: "Recovered",
      historySubtitle: "Full call and SMS history.",
      showMore: "Show more",
      showLess: "Show less",
      outcomes: {
        booked: "Booked",
        lead_captured: "Lead captured",
        transferred: "Transferred",
        dropped: "Missed",
        other: "Other",
      },
    },
    trial: { title: "Your trial", plan: "Plan", ends: "Ends on" },
    setupChecklist: {
      label: "Go live",
      title: "Get your AI receptionist ready",
      subtitle: "Complete these steps before your first customer calls.",
      bookLink: "Public booking page:",
      items: {
        services: "Add your services",
        hours: "Set your business hours",
        voice: "Activate voice agent (sync)",
        greeting: "Customize your phone greeting",
        bookPage: "Publish your booking link",
      },
    },
    smsStatus: {
      pausedTitle: "Automated SMS paused",
      pausedBody:
        "Confirmation and reminder texts are temporarily paused — your phone line and inbound texts still work.",
      warnTitle: "SMS limit almost reached",
      warnBody:
        "You're approaching your plan's outbound SMS limit. Upgrade to Pro if you need more capacity.",
      usageLine: "Usage: {used} / {limit} SMS this month",
      billingLink: "View billing →",
    },
    common: {
      delete: "Delete",
      deleteConfirmBooking: "Delete this booking? This cannot be undone.",
      deleteConfirmLead: "Delete this lead? This cannot be undone.",
      deleteConfirmCall: "Delete this activity? This cannot be undone.",
      deleteConfirmCustomer: "Delete this customer? This cannot be undone.",
      deleteError: "Could not delete — please try again.",
    },
    settings: {
      subtitle: "Your account information.",
      business: "Business",
      email: "Email",
      plan: "Plan",
      language: "Language",
      billingNote: "Stripe billing will be available when full plan activation ships.",
      profileTitle: "Business profile",
      profileSubtitle: "Edit your details — the voice agent syncs automatically on save.",
      businessName: "Business name",
      city: "City",
      industry: "Industry / Specialty",
      industryPlaceholder: "e.g. Hair Salon, Plumber, Dental Office",
      forwardTo: "Forward calls to (optional)",
      forwardToPlaceholder: "+1 514 555 1234",
      save: "Save & sync voice",
      saving: "Saving…",
      saved: "Saved — voice agent updated.",
      saveError: "Error — please try again.",
      removeService: "Remove service",
    },
    voice: {
      title: "AI receptionist",
      subtitle: "Your voice agent is built automatically from your services and hours.",
      status: "Status",
      statusReady: "Active",
      statusPending: "Pending — finish onboarding or sync",
      line: "Phone line",
      agentId: "Vapi agent",
      sharedLineNote:
        "During trial, the shared line routes to the last synced agent. Each salon gets its own voice agent.",
      syncCta: "Sync voice agent",
      syncing: "Syncing…",
      syncDone: "Voice agent updated with your latest business info.",
      syncError: "Sync failed — please try again.",
      customTitle: "Customize what your AI says",
      customSubtitle:
        "Tell your AI exactly how to talk to your customers.",
      greetingLabel: "How should the AI answer the phone?",
      greetingHint: "Example: 'Hi! Thanks for calling the Clinic. How can I help you today?'",
      instructionsLabel: "Rules for the AI to follow",
      instructionsPlaceholder:
        "Write simple rules here. For example: 'Always ask if they have been here before' or 'Tell them we only accept cash'.",
      instructionsHint: "Write exactly what you want the AI to know, in plain English.",
      saveCustom: "Save & sync voice",
      saving: "Saving…",
      customSaved: "Customization saved — voice agent updated.",
      saveError: "Error — please try again.",
    },
    bookings: {
      add: "New booking",
      customerName: "Customer name",
      phone: "Phone",
      serviceOptional: "Service (optional)",
      staffOptional: "Staff member (optional)",
      notes: "Notes",
      save: "Save",
      cancel: "Cancel",
      empty: "No bookings yet.",
      error: "Error — please try again.",
      sendSms: "SMS",
      smsSent: "SMS sent",
      smsError: "SMS failed",
      noPhone: "No phone",
      sendReminder: "Reminder",
      filterUpcoming: "Upcoming",
      filterPast: "Past",
      filterAll: "All",
      statuses: {
        booked: "Booked",
        confirmed: "Confirmed",
        cancelled: "Cancelled",
        noShow: "No-show",
        completed: "Completed",
      },
      edit: "Edit",
      saveEdit: "Save",
      cancelEdit: "Cancel",
    },
    leads: {
      add: "New lead",
      name: "Name",
      phone: "Phone",
      notes: "Notes",
      save: "Save",
      saveNotes: "Save notes",
      savingNotes: "Saving…",
      bookCta: "Book",
      bookHint: "Create an appointment — the lead will move to Booked.",
      empty: "No leads yet.",
      error: "Error — please try again.",
      sources: { manual: "Manual", missedCall: "Missed call", webForm: "Web form", sms: "SMS" },
      stages: { new: "New", contacted: "Contacted", booked: "Booked", lost: "Lost" },
    },
    customers: {
      subtitle: "Customers are created automatically when bookings are made.",
      empty: "No customers yet.",
      phone: "Phone",
      email: "Email",
      added: "Added",
      save: "Save",
      saving: "Saving…",
    },
    staff: {
      title: "Team",
      subtitle: "Add staff members to assign to bookings.",
      empty: "No staff yet — add your first below.",
      namePlaceholder: "Display name",
      add: "Add",
      remove: "Remove",
      error: "Error — please try again.",
    },
    embed: {
      title: "Web widget",
      subtitle: "Share your booking page or embed a contact form on your site.",
      bookingPage: "Public booking page",
      embedCode: "Embed code (iframe)",
      copy: "Copy link",
      copyEmbed: "Copy code",
      copied: "Copied!",
      iframeTitle: "Contact us",
    },
    embedForm: {
      name: "Your name",
      phone: "Phone",
      notes: "Message (optional)",
      submit: "Send",
      success: "Thanks! We'll be in touch soon.",
      error: "Error — please try again.",
    },
    publicBook: {
      title: "Book online",
      name: "Your name",
      phone: "Phone",
      email: "Email (optional)",
      service: "Choose a service",
      date: "Date",
      time: "Time",
      notes: "Notes (optional)",
      submit: "Confirm booking",
      success: "Booking confirmed! You'll get an SMS confirmation if you provided a phone number.",
      error: "Could not book — please pick another time slot.",
      noSlots: "No available slots on this day.",
      pickService: "No services available right now.",
    },
    billing: {
      title: "Billing",
      subtitle: "Manage your plan and payments.",
      notConfigured: "Billing is not enabled on this site yet.",
      currentPlan: "Current plan",
      trialEnds: "Trial ends",
      nextBilling: "Next billing date",
      status: "Status",
      statuses: {
        trialing: "Trial",
        active: "Active",
        past_due: "Past due",
        canceled: "Canceled",
        unpaid: "Unpaid",
      },
      checkoutCanceled: "Checkout canceled — you can try again anytime.",
      pastDue: "Your payment failed. Update your card to avoid interruption.",
      trialBanner: "Add a payment method before your trial ends to keep access.",
      monthly: "Monthly",
      annual: "Annual",
      manageBilling: "Manage billing",
      subscribe: "Subscribe",
      error: "Something went wrong — try again or contact support.",
      successTitle: "Payment set up",
      successBody: "Thank you! Your subscription is being activated.",
      backToSettings: "Back to settings",
      usageTitle: "Usage this month",
      usageBookings: "Bookings",
      usageSms: "SMS",
      usageVoice: "Voice minutes",
      usageStaff: "Active staff",
      unlimited: "Unlimited",
      usageWarn:
        "You're approaching your plan limit this month. Upgrade if you need more capacity.",
      usageCritical:
        "Plan limit reached or exceeded. Inbound calls still work — monitor usage or upgrade to Pro.",
      usageMeterWarn: "Near limit",
      usageMeterCritical: "At limit",
    },
  },
  onboarding: {
    title: "Premium onboarding intake",
    subtitle: "Tell us about your services. Our team will tailor your luxury AI concierge.",
    step: "Step",
    next: "Continue",
    error: "Error — please try again.",
    days: {
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
      sun: "Sun",
    },
    hours: {
      title: "Business hours",
      subtitle: "Used to offer available time slots to customers.",
    },
    services: {
      title: "Your services",
      subtitle: "Add at least one service you offer to customers.",
      name: "Name",
      duration: "Duration (min)",
      price: "Price ($)",
      add: "Add service",
    },
    done: {
      title: "Intake submitted successfully",
      subtitle:
        "We are now custom-tailoring your AI concierge. You can access your dashboard while we finalize the setup.",
      cta: "Access my dashboard",
    },
    businessTypes: {
      title: "Business type",
      subtitle: "We'll tailor your luxury AI to your specialty.",
      salon: "Luxury salon or spa",
      salonDesc: "High-end hair, aesthetic, and wellness.",
      trade: "Boutique clinic",
      tradeDesc: "Specialized medical or aesthetic clinic.",
      office: "Professional office",
      officeDesc: "High-end professional consultations.",
    },
  },
  verticals: {
    label: "Who it's for",
    title: "Built for your kind of business",
    subtitle:
      "Same AI receptionist — tuned for luxury salons, med spas, and high-end clinics.",
    items: [
      {
        title: "Luxury Salons & Barbershops",
        desc: "AI understands \"I want a balayage\" or \"a fade\", offers slots, and sends SMS reminders.",
        examples: ["Cut & color", "Beard & fade", "Extensions"],
      },
      {
        title: "Med Spas",
        desc: "Automate consultations for Botox, laser, and fillers with a polished digital concierge.",
        examples: ["Injectables", "Laser hair removal", "Consultations"],
      },
      {
        title: "Aesthetic Clinics",
        desc: "Premium booking experience for high-ticket clients and specialized treatments.",
        examples: ["Skin assessment", "Facial treatments", "New patients"],
      },
    ],
  },
};

const dictionaries: Record<Locale, Dictionary> = { fr, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.fr;
}

export const PLAN_PRICES = {
  starter: { monthly: 79, annual: 790 },
  white_glove: { monthly: 199, annual: 1990 },
} as const;