import { NextResponse } from "next/server";
import { customization, customizationOptions } from "@/lib/customization";
import { componentCatalog } from "@/components/ui/catalog";
import { componentSlotContracts } from "@/lib/component-slots";
import { layoutCompositionHooks } from "@/lib/layout-composition";
import {
  SPACE_NAVIGATION_MODES,
  spaceCustomizationContract,
  spaceCustomizationMigrationGuide,
} from "@/lib/space-customization";
import {
  SPACE_HEALTH_SIGNALS,
  SPACE_VISIBILITY_MODES,
  spaceGovernanceContract,
} from "@/lib/space-governance";
import {
  builtInSpaceTemplates,
  spaceTemplateContract,
  spaceTemplateRegistry,
} from "@/lib/space-templates";
import {
  MARKETPLACE_IMPORT_SCHEMA_VERSION,
  SUPPORTED_MARKETPLACE_IMPORT_KINDS,
  marketplaceImportContract,
  marketplaceImportExamples,
} from "@/lib/marketplace-import";
import { pluginManifestRegistry } from "@/lib/plugin-manifest";
import { trustedPluginLoaderContract } from "@/lib/plugins/local-loader";
import { portableBundleContract } from "@/lib/portable-bundle";
import { exportHardeningContract } from "@/lib/export-hardening";
import { importRehearsalContract } from "@/lib/import-rehearsal";
import { workspaceContract } from "@/lib/workspaces";
import { roleTemplateContract } from "@/lib/role-templates";
import { collaborationControlsContract } from "@/lib/collaboration-controls";
import { editorialGovernanceContract } from "@/lib/editorial-governance";
import { auditTrailContract } from "@/lib/audit";
import { moderationContract } from "@/lib/moderation";
import { searchRelevanceContract } from "@/lib/search-relevance";
import { discoveryEngineContract } from "@/lib/discovery-engines";
import { searchApiContract } from "@/lib/search-api";
import { editorReliabilityContract } from "@/lib/editor-reliability";
import { editorControlsContract } from "@/lib/editor-controls";
import { collaborationUxContract } from "@/lib/collaboration-ux";
import { publicApiV1Contract } from "@/lib/public-api-v1";
import { sdkTypesContract } from "@/lib/sdk-types";
import { webhookReliabilityContract } from "@/lib/webhook-reliability";
import { operationsDashboardContract } from "@/lib/operations-dashboard";
import { maintenanceToolingContract } from "@/lib/maintenance-tooling";
import { observabilityContract } from "@/lib/observability";
import { performanceBudgetsContract } from "@/lib/performance-budgets";
import { cacheStrategyContract } from "@/lib/cache-strategy";
import { offlinePwaContract } from "@/lib/offline-pwa";
import { securityReviewContract } from "@/lib/security-review";
import { privacyControlsContract } from "@/lib/privacy-controls";
import { marketplaceSecurityContract } from "@/lib/marketplace-security";
import { marketplaceBetaContract } from "@/lib/marketplace-beta";
import { marketplaceLifecycleContract } from "@/lib/marketplace-lifecycle";
import { marketplaceAuthoringContract } from "@/lib/marketplace-authoring";
import { templateMarketplaceContract } from "@/lib/template-marketplace";
import { domainWorkflowContract } from "@/lib/domain-workflows";
import { assistantPackContract } from "@/lib/assistant-packs";
import { assistantGovernanceContract } from "@/lib/assistant-governance";
import { syncManifestContract } from "@/lib/sync-manifests";
import { externalReferenceContract } from "@/lib/external-references";
import { archiveMirrorContract } from "@/lib/archive-mirrors";
import { mobilePolishContract } from "@/lib/mobile-polish";
import { desktopResearchContract } from "@/lib/desktop-research";
import { accessibilityFinishContract } from "@/lib/accessibility-finish";
import { migrationReadinessContract } from "@/lib/migration-readiness";
import { backupRestoreContract } from "@/lib/backup-restore";
import { upgradeAssistantContract } from "@/lib/upgrade-assistant";
import { testQualityGatesContract } from "@/lib/test-quality-gates";
import { e2eSmokeSuiteContract } from "@/lib/e2e-smoke-suite";
import { releaseGateAutomationContract } from "@/lib/release-gate-automation";
import { documentationOnboardingContract } from "@/lib/documentation-onboarding";
import { inAppOnboardingContract } from "@/lib/in-app-onboarding";
import { exampleSiteRecipesContract } from "@/lib/example-site-recipes";
import { featureFreezeContract } from "@/lib/feature-freeze";
import { releaseCandidateOneContract } from "@/lib/release-candidate-one";
import { finalReleaseGatesContract } from "@/lib/final-release-gates";
import {
  colorThemePresets,
  componentPacks,
  createMarketplaceRegistry,
  layoutPresets,
  marketplaceItems,
  marketplaceRegistryContract,
  perSpaceCustomizationContract,
  pluginManifests,
  stylePresets,
  templatePacks,
  themePackSchema,
  themePacks,
} from "@/lib/marketplace";

export async function GET() {
  const registry = createMarketplaceRegistry();

  return NextResponse.json({
    customization,
    options: customizationOptions,
    stylePresets,
    colorThemePresets,
    layoutPresets,
    componentPacks,
    componentSlots: componentSlotContracts,
    layoutComposition: layoutCompositionHooks,
    spaceCustomization: {
      contract: spaceCustomizationContract,
      migrationGuide: spaceCustomizationMigrationGuide,
      navigationModes: SPACE_NAVIGATION_MODES,
    },
    spaceTemplates: {
      contract: spaceTemplateContract,
      registry: spaceTemplateRegistry,
      templates: builtInSpaceTemplates,
    },
    spaceGovernance: {
      contract: spaceGovernanceContract,
      healthSignals: SPACE_HEALTH_SIGNALS,
      visibilityModes: SPACE_VISIBILITY_MODES,
    },
    pluginManifestSchema: pluginManifestRegistry,
    pluginRuntime: trustedPluginLoaderContract,
    portableBundle: portableBundleContract,
    exportHardening: exportHardeningContract,
    importRehearsal: importRehearsalContract,
    workspaces: workspaceContract,
    roleTemplates: roleTemplateContract,
    collaborationControls: collaborationControlsContract,
    editorialGovernance: editorialGovernanceContract,
    auditTrail: auditTrailContract,
    moderation: moderationContract,
    searchRelevance: searchRelevanceContract,
    discoveryEngines: discoveryEngineContract,
    searchApi: searchApiContract,
    editorReliability: editorReliabilityContract,
    editorControls: editorControlsContract,
    collaborationUx: collaborationUxContract,
    publicApiV1: publicApiV1Contract,
    sdkTypes: sdkTypesContract,
    webhookReliability: webhookReliabilityContract,
    operationsDashboard: operationsDashboardContract,
    maintenanceTooling: maintenanceToolingContract,
    observability: observabilityContract,
    performanceBudgets: performanceBudgetsContract,
    cacheStrategy: cacheStrategyContract,
    offlinePwa: offlinePwaContract,
    securityReview: securityReviewContract,
    privacyControls: privacyControlsContract,
    marketplaceSecurity: marketplaceSecurityContract,
    marketplaceBeta: marketplaceBetaContract,
    marketplaceLifecycle: marketplaceLifecycleContract,
    marketplaceAuthoring: marketplaceAuthoringContract,
    templateMarketplace: templateMarketplaceContract,
    domainWorkflows: domainWorkflowContract,
    assistantPacks: assistantPackContract,
    assistantGovernance: assistantGovernanceContract,
    syncManifests: syncManifestContract,
    externalReferences: externalReferenceContract,
    archiveMirrors: archiveMirrorContract,
    mobilePolish: mobilePolishContract,
    desktopResearch: desktopResearchContract,
    accessibilityFinish: accessibilityFinishContract,
    migrationReadiness: migrationReadinessContract,
    backupRestore: backupRestoreContract,
    upgradeAssistant: upgradeAssistantContract,
    testQualityGates: testQualityGatesContract,
    e2eSmokeSuite: e2eSmokeSuiteContract,
    releaseGateAutomation: releaseGateAutomationContract,
    documentationOnboarding: documentationOnboardingContract,
    inAppOnboarding: inAppOnboardingContract,
    exampleSiteRecipes: exampleSiteRecipesContract,
    featureFreeze: featureFreezeContract,
    releaseCandidateOne: releaseCandidateOneContract,
    finalReleaseGates: finalReleaseGatesContract,
    pluginManifests,
    themePackSchema,
    themePacks,
    templatePacks,
    perSpaceCustomizationContract,
    ui: {
      componentCatalog,
      stylePresets,
      colorThemePresets,
      layoutPresets,
      componentPacks,
      componentSlots: componentSlotContracts,
      layoutComposition: layoutCompositionHooks,
      spaceCustomization: {
        contract: spaceCustomizationContract,
        migrationGuide: spaceCustomizationMigrationGuide,
        navigationModes: SPACE_NAVIGATION_MODES,
      },
      spaceTemplates: {
        contract: spaceTemplateContract,
        registry: spaceTemplateRegistry,
        templates: builtInSpaceTemplates,
      },
      spaceGovernance: {
        contract: spaceGovernanceContract,
        healthSignals: SPACE_HEALTH_SIGNALS,
        visibilityModes: SPACE_VISIBILITY_MODES,
      },
      pluginManifestSchema: pluginManifestRegistry,
      pluginRuntime: trustedPluginLoaderContract,
      portableBundle: portableBundleContract,
      exportHardening: exportHardeningContract,
      importRehearsal: importRehearsalContract,
      workspaces: workspaceContract,
      roleTemplates: roleTemplateContract,
      collaborationControls: collaborationControlsContract,
      editorialGovernance: editorialGovernanceContract,
      auditTrail: auditTrailContract,
      moderation: moderationContract,
      searchRelevance: searchRelevanceContract,
      discoveryEngines: discoveryEngineContract,
      searchApi: searchApiContract,
      editorReliability: editorReliabilityContract,
      editorControls: editorControlsContract,
      collaborationUx: collaborationUxContract,
      publicApiV1: publicApiV1Contract,
      sdkTypes: sdkTypesContract,
      webhookReliability: webhookReliabilityContract,
      operationsDashboard: operationsDashboardContract,
      maintenanceTooling: maintenanceToolingContract,
      observability: observabilityContract,
      performanceBudgets: performanceBudgetsContract,
      cacheStrategy: cacheStrategyContract,
      offlinePwa: offlinePwaContract,
      securityReview: securityReviewContract,
      privacyControls: privacyControlsContract,
      marketplaceSecurity: marketplaceSecurityContract,
      marketplaceBeta: marketplaceBetaContract,
      marketplaceLifecycle: marketplaceLifecycleContract,
      marketplaceAuthoring: marketplaceAuthoringContract,
      templateMarketplace: templateMarketplaceContract,
      domainWorkflows: domainWorkflowContract,
      assistantPacks: assistantPackContract,
      assistantGovernance: assistantGovernanceContract,
      syncManifests: syncManifestContract,
      externalReferences: externalReferenceContract,
      archiveMirrors: archiveMirrorContract,
      mobilePolish: mobilePolishContract,
      desktopResearch: desktopResearchContract,
      accessibilityFinish: accessibilityFinishContract,
      migrationReadiness: migrationReadinessContract,
      backupRestore: backupRestoreContract,
      upgradeAssistant: upgradeAssistantContract,
      testQualityGates: testQualityGatesContract,
      e2eSmokeSuite: e2eSmokeSuiteContract,
      releaseGateAutomation: releaseGateAutomationContract,
      documentationOnboarding: documentationOnboardingContract,
      inAppOnboarding: inAppOnboardingContract,
      exampleSiteRecipes: exampleSiteRecipesContract,
      featureFreeze: featureFreezeContract,
      releaseCandidateOne: releaseCandidateOneContract,
      finalReleaseGates: finalReleaseGatesContract,
      pluginManifests,
      themePackSchema,
      themePacks,
      templatePacks,
      perSpaceCustomizationContract,
      themeHooks: [
        "src/app/globals.css @theme tokens",
        "html[data-theme=\"dark\"] overrides",
        "html[data-style=\"classic-wiki\"] default skin",
        "html[data-style=\"atlas-modern\"] alternate built-in skin",
        "html[data-color-theme=\"standard\"] default color palette",
        "html[data-color-theme=\"forest\"] alternate built-in color palette",
        "html[data-color-theme=\"ember\"] alternate built-in color palette",
        "html[data-layout=\"classic-wiki\"] default layout preset hook",
        "html[data-layout=\"docs-portal\"] docs portal layout composition hook",
        "html[data-layout=\"team-knowledge-base\"] team knowledge base layout composition hook",
        "html[data-layout=\"worldbuilding-atlas\"] worldbuilding atlas layout composition hook",
        "html[data-layout=\"research-notebook\"] research notebook layout composition hook",
        "ui-* shared component classes",
        "wiki-* product shell classes",
      ],
    },
    marketplace: {
      items: marketplaceItems,
      registry,
      registryVersion: registry.version,
      schemaVersion: registry.schemaVersion,
      catalogSource: registry.source,
      contract: marketplaceRegistryContract,
      importPreview: {
        contract: marketplaceImportContract,
        examples: marketplaceImportExamples,
        previewOnly: true,
        schemaVersion: MARKETPLACE_IMPORT_SCHEMA_VERSION,
        supportedKinds: SUPPORTED_MARKETPLACE_IMPORT_KINDS,
      },
      pluginManifestSchema: pluginManifestRegistry,
      pluginRuntime: trustedPluginLoaderContract,
      portableBundle: portableBundleContract,
      exportHardening: exportHardeningContract,
      importRehearsal: importRehearsalContract,
      workspaces: workspaceContract,
      roleTemplates: roleTemplateContract,
      collaborationControls: collaborationControlsContract,
      editorialGovernance: editorialGovernanceContract,
      auditTrail: auditTrailContract,
      moderation: moderationContract,
      searchRelevance: searchRelevanceContract,
      discoveryEngines: discoveryEngineContract,
      searchApi: searchApiContract,
      editorReliability: editorReliabilityContract,
      editorControls: editorControlsContract,
      collaborationUx: collaborationUxContract,
      publicApiV1: publicApiV1Contract,
      sdkTypes: sdkTypesContract,
      webhookReliability: webhookReliabilityContract,
      operationsDashboard: operationsDashboardContract,
      maintenanceTooling: maintenanceToolingContract,
      observability: observabilityContract,
      performanceBudgets: performanceBudgetsContract,
      cacheStrategy: cacheStrategyContract,
      marketplaceAuthoring: marketplaceAuthoringContract,
      templateMarketplace: templateMarketplaceContract,
      domainWorkflows: domainWorkflowContract,
      assistantPacks: assistantPackContract,
      assistantGovernance: assistantGovernanceContract,
      syncManifests: syncManifestContract,
      externalReferences: externalReferenceContract,
      archiveMirrors: archiveMirrorContract,
      mobilePolish: mobilePolishContract,
      desktopResearch: desktopResearchContract,
      accessibilityFinish: accessibilityFinishContract,
      migrationReadiness: migrationReadinessContract,
      backupRestore: backupRestoreContract,
      upgradeAssistant: upgradeAssistantContract,
      testQualityGates: testQualityGatesContract,
      e2eSmokeSuite: e2eSmokeSuiteContract,
      releaseGateAutomation: releaseGateAutomationContract,
      documentationOnboarding: documentationOnboardingContract,
      inAppOnboarding: inAppOnboardingContract,
      exampleSiteRecipes: exampleSiteRecipesContract,
      featureFreeze: featureFreezeContract,
      releaseCandidateOne: releaseCandidateOneContract,
      finalReleaseGates: finalReleaseGatesContract,
      validation: registry.validation,
    },
  });
}
