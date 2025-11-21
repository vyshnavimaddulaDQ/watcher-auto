const targetEnvironment = process.env.TARGET_ENVIRONMENT ?? 'qa';

const getDomain = (environment: string): string => {
  if (environment === 'qa') return 'https://axe-qa.dequelabs.com';
  else if (environment === 'dev') return 'https://axe.dequelabs.com';
  return '';
};

const getLoginPageAuth = (environment: string): string => {
  if (environment === 'qa')
    return 'https://auth-qa.dequelabs.com/auth/realms/axe-qa/protocol/openid-connect/auth';
  else if (environment === 'dev')
    return 'https://auth.dequelabs.com/auth/realms/axe/protocol/openid-connect/auth';
  return '';
};

const getEditMyInformationPage = (environment: string): string => {
  if (environment === 'qa') return 'https://auth-qa.dequelabs.com/auth/realms/axe-qa/account';
  else if (environment === 'dev') return 'https://auth.dequelabs.com/auth/realms/axe-qa/account';
  return '';
};

interface IssuesPageStatesValidation {
  issues: string;
  pageStates: string;
  accessibilityIssuesCount: number;
  dropdownAllPageStates?: string[];
  manualPageStates?: string;
  pageStateDropdownValue?: string;
  issuesDetails?: Record<string, string>;
  warningMessage?: string;
}

interface TestData {
  title: {
    productsPage: string;
    projectsPage: string;
    startupPage: string;
    instructionsPage: string;
    branchesPage: string;
    commitsPage: string;
    issuesPage: string;
    viewDocumentationPage: string;
    configurationPage: string;
    loginPage: string;
    welcomePage: string;
    signUpPage: string;
    userAccessPage: string;
    settingsPage: string;
    userManagementPage: string;
    axeWatcherAddUserPage: string;
  };
  environment: {
    domain: string;
    loginPageAuth: string;
    editMyInformationPage: string;
  };
  credentials: {
    herokuUsername: string;
    herokuPassword: string;
  };
  selectors: {
    herokuSubmitButton: string;
    flashMessageSelector: string;
  };
  cypressMultiPage: {
    issuesCount: string;
    pageStates: string;
    accessibilityIssuesCount: number;
    dropdownAllPageStates: string[];
  };
  wdjsMultiPage: {
    issuesCount: string;
    pageStates: string;
    accessibilityIssuesCount: number;
    dropdownAllPageStates: string[];
  };
  issuesPageStatesValidations: {
    brokenWorkshop: IssuesPageStatesValidation;
    abcdPage: IssuesPageStatesValidation;
    marsPage: IssuesPageStatesValidation;
    multipleIts: IssuesPageStatesValidation;
    multipleDesc: IssuesPageStatesValidation;
    autoAnalyzeMode: IssuesPageStatesValidation;
    manualMode: IssuesPageStatesValidation;
    axeConfigs: IssuesPageStatesValidation;
    excludeUrls: IssuesPageStatesValidation;
    configOverride: IssuesPageStatesValidation;
    wrapMethods: IssuesPageStatesValidation;
    dynamicPage: IssuesPageStatesValidation;
    multiPages: IssuesPageStatesValidation;
    desktopPage: IssuesPageStatesValidation;
    AutoAnalyzeModeTest: IssuesPageStatesValidation;
    AxeConfigurationsTest: IssuesPageStatesValidation;
    ConfigOverrideTest: IssuesPageStatesValidation;
    ExcludeUrlTest: IssuesPageStatesValidation;
    ManualModeTest: IssuesPageStatesValidation;
    NegativeTest: IssuesPageStatesValidation;
    NewBranchTest: IssuesPageStatesValidation;
    WrapMethodsTest: IssuesPageStatesValidation;
    [key: string]: IssuesPageStatesValidation;
  };
  testTitles: {
    brokenWorkshop: string;
    abcdPage: string;
    testPage: string;
    cleanPage: string;
    dequeContactPage: string;
    marsPage: string;
    qaTestPage: string;
  };
  urls: {
    loginPage: string;
    healthCheckPage: string;
    internalFeatures: string;
    productsPage: string;
    configurationPageUrl: string;
    projectsPageUrl: string;
    startupPageUrl: string;
    viewDocumentationLink: string;
    welcomePage: string;
    signUpPage: string;
    userAccess: string;
    loginPageAuth: string;
    editMyInformation: string;
    settings: string;
    sendFeedback: string;
  };
  testUrls: {
    marsPage: string;
    abcdPage: string;
    abcdLaptopsAndNotebooks: string;
    abcdSupport: string;
    abcdDesktop: string;
    abcdCart: string;
    testPage: string;
    cleanPage: string;
    twoKIssuesPage: string;
    dequeContact: string;
    brokenWorkshop: string;
    ariaHiddenPage: string;
    forgotPassword: string;
    herokuLogin: string;
    heroku: string;
    qaTestPage: string;
    actions: string;
  };
  messages: {
    configurationToast: string;
    branchesShareToast: string;
    commitsShareToast: string;
    issuesPageShareProjectToast: string;
    shareIssueToast: string;
    projectsPageAPIKeyToast: string;
    sendFeedback: string;
  };
  userData: {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    companyName: string;
    password: string;
    confirmPassword: string;
  };
  userAccessStatus: {
    emailSent: string;
    activeUser: string;
  };
  dequeEmail: {
    userActivationNotification: string;
  };
  products: {
    axeWatcher: string;
  };
  testUsers: {
    entUserName: string;
    password: string;
    entAdminUserName: string;
    entUser: string;
  };
  productAccess: {
    watcher: string;
    admin: string;
    axeAccount: string;
  };
  textValidations: {
    timeStamp: string;
    timeStampForMin: string;
    timeStampForTwo: string;
    timeStampForThree: string;
    defaultTag: string;
    mainBranch: string;
    nonDefaultBranch: string;
    mainBranchTestId: string;
    noDefaultBranch: string;
  };
  instructionHeaderText: {
    cypress: string;
    playwrightTest: string;
    playwright: string;
    puppeteer: string;
    webdriverIO: string;
    webdriverIOTestrunner: string;
    webDriverJS: string;
  };
  platforms: {
    cypress: string;
    playwrightTest: string;
    playwright: string;
    puppeteer: string;
    webdriverIO: string;
    webdriverIOTestrunner: string;
    webDriverJS: string;
  };
  ruleNames: {
    colorContrast: string;
    imageAlt: string;
    label: string;
    linkInTextBlock: string;
    linkName: string;
  };
  ruleIDs: {
    colorContrast: string;
    imageAlt: string;
    label: string;
    linkInTextBlock: string;
    linkName: string;
  };
  abcdPageRuleIssuesCount: {
    colorContrast: string;
    imageAlt: string;
    label: string;
    linkInTextBlock: string;
    linkName: string;
  };
  ruleData: {
    pageState: string;
    ccIssueDesc: string;
    ccSelector: string;
    ccElementSource: string;
    ccImpact: string;
    ccMoreInfo: string;
    issueDesc: string;
    selector: string;
    elementSource: string;
    impact: string;
    moreInfo: string;
  };
  abcdPageValidations: {
    issuesCount: string;
    pageState: string;
    ddAllPageState: string;
    pageStateDDValue: string;
    a11yIssuesCount: string;
  };
  values: {
    num1: number;
  };
  multiPage: {
    emailTextbox: string;
    emailValue: string;
    submitButton: string;
    title: string;
    links: string;
    loginLink: string;
    headerSelector: string;
    username: string;
    usernameValue: string;
    password: string;
    passwordValue: string;
    herokuSubmit: string;
    flashSelector: string;
    issuesCount: string;
    pageState: string;
    ddAllPageState: string;
    a11yIssuesCount: string;
    cypressIssuesCount1: string;
    cypressIssuesCount2: string;
    cypressPageState: string;
    cypressDdAllPageState: string;
    wdjsIssuesCount: string;
    wdjsPageState: string;
    wdjsDdAllPageState: string;
    wdjsA11yIssuesCount: string;
    securePage: string;
    length: string;
  };
  multiitsManual: {
    issuesCount: string;
    pageState: string;
    accessibilityIssuesCount: number;
    dropdownAllPageStates: string[];
  };
  herokuManual: {
    issuesCount: string;
    pageState: string;
    accessibilityIssuesCount: number;
    dropdownAllPageStates: string[];
  };
  configurationTestsValidations: {
    abcdPageSelectors: {
      laptopsAndNotebooks: string;
      desktops: string;
      cart: string;
      support: string;
      contact: string;
    };
    dynamicPageSelectors: {
      activitiesLabel: string;
      passesLabel: string;
      hotelsLabel: string;
      reservationsLabel: string;
      roundtripRadioButton: string;
    };
    disableRuleTests: IssuesPageStatesValidation;
    excludeContextConfigTests: IssuesPageStatesValidation;
    multipleUrlsPatternConfigTests: IssuesPageStatesValidation;
    singleUrlPatternConfigTests: IssuesPageStatesValidation;
    includeContextConfigTests: IssuesPageStatesValidation;
    multiItsExlcudeUrlsConfigTests: IssuesPageStatesValidation;
    runOptionsConfigTests: IssuesPageStatesValidation;
    rulesAndTagOptionsConfigTests: IssuesPageStatesValidation;
  };
}

export const testData: TestData = {
  title: {
    productsPage: 'Products | axe DevTools',
    projectsPage: 'Projects | axe Developer Hub | axe DevTools',
    startupPage: 'Empower your end-to-end tests | axe DevTools',
    instructionsPage: 'Instructions | axe DevTools Watcher | axe DevTools',
    branchesPage: '_projectname_ | Branches | axe DevTools',
    commitsPage: '_branchname_ | Commits | axe DevTools',
    issuesPage: '_commitmessage_ | Issues | axe DevTools',
    viewDocumentationPage: 'Get Started with axe Developer Hub | Deque Docs',
    configurationPage: 'Configuration | axe DevTools',
    loginPage: 'Sign in | Deque',
    welcomePage: 'Welcome | axe DevTools',
    signUpPage: 'Sign up | axe DevTools',
    userAccessPage: 'axe DevTools Pro User Access | axe DevTools',
    settingsPage: 'Settings | axe DevTools',
    userManagementPage: 'Deque Products User Management | axe DevTools',
    axeWatcherAddUserPage: 'Add users to axe Developer Hub | axe DevTools'
  },
 
  environment: {
    domain: getDomain(targetEnvironment),
    loginPageAuth: getLoginPageAuth(targetEnvironment),
    editMyInformationPage: getEditMyInformationPage(targetEnvironment)
  },
  credentials: {
    herokuUsername: 'myHerokuUsername',
    herokuPassword: 'SuperSecretPassword!'
  },
  selectors: {
    herokuSubmitButton: 'button[type="submit"]',
    flashMessageSelector: '#flash'
  },
  cypressMultiPage: {
    issuesCount: '(53) total issues',
    pageStates: '(6) total page states',
    accessibilityIssuesCount: 53,
    dropdownAllPageStates: [
      'All page states (6)',
      '[no title] .../forgot_password [unique issues: 2]',
      'The Internet .../forgot_password [unique issues: 2]',
      'The Internet the-internet.herokuapp.com/ [unique issues: 45]',
      'The Internet .../login [unique issues: 2]',
      'The Internet .../secure [unique issues: 2]'
    ],
  },

  wdjsMultiPage: {
    issuesCount: '(49) total issues',
    pageStates: '(8) total page states',
    accessibilityIssuesCount: 49,
    dropdownAllPageStates: [
      'All page states (8)',
      'The Internet .../forgot_password [unique issues: 1]',
      '[no title] .../forgot_password [unique issues: 2]',
      'The Internet the-internet.herokuapp.com/ [unique issues: 44]',
      'The Internet .../secure [unique issues: 1]',
      'The Internet .../login [unique issues: 1]'
    ],
  },
  issuesPageStatesValidations: {
    brokenWorkshop: {
      issues: '(12) total issues',
      pageStates: '(1) total page states',
      accessibilityIssuesCount: 12,
      dropdownAllPageStates: [
        'All page states (1)',
        '[INSERT TITLE HERE] broken-workshop.dequelabs.com/ [unique issues: 12]'
      ],
      pageStateDropdownValue: 'broken-workshop.dequelabs.com/',
      issuesDetails: {
        'color-contrast': '4 issues',
        'image-alt': '8 issues'
      }
    },
    abcdPage: {
      issues: '(29) total issues',
      pageStates: '(1) total page states',
      accessibilityIssuesCount: 29,
      manualPageStates: '(4) total page states',
      dropdownAllPageStates: [
        'All page states (1)',
        'Gefälscht~~~Gefälscht CompuTech~~~ abcdcomputech.dequecloud.com/ [unique issues: 29]'
      ],
      issuesDetails: {
        'color-contrast': '13 issues',
        'image-alt': '8 issues',
        label: '1 issue',
        'link-in-text-block': '2 issues',
        'link-name': '5 issues'
      }
    },
    marsPage: {
      issues: '(24) total issues',
      pageStates: '(1) total page states',
      accessibilityIssuesCount: 24,
      dropdownAllPageStates: [
        'All page states (1)',
        'Mars Commuter: Travel to Mars for Work or Pleasure! dequeuniversity.com/demo/mars/ [unique issues: 24]'
      ],
      issuesDetails: {
        'button-name': '1 issue',
        'color-contrast': '6 issues',
        'frame-title': '1 issue',
        'html-has-lang': '1 issue',
        'image-alt': '4 issues',
        'link-in-text-block': '1 issue',
        'link-name': '8 issues',
        'select-name': '2 issues'
      }
    },
    multipleIts: {
      issues: '(113) total issues',
      pageStates: '(5) total page states',
      accessibilityIssuesCount: 113,
      dropdownAllPageStates: [
        'All page states (5)',
        '[INSERT TITLE HERE] broken-workshop.dequelabs.com/ [unique issues: 12]',
        'Gefälscht~~~Gefälscht CompuTech~~~ abcdcomputech.dequecloud.com/ [unique issues: 29]',
        '[DOCUMENT TITLE] workshop2.dequelabs.com/ [unique issues: 18]',
        'Test File - Clean Page qateam.dequecloud.com/testf... [unique issues: 0]',
        'Gefälscht~~~Gefälscht CompuTech~~~ .../desktops.php [unique issues: 54]'
      ]
    },
    multipleDesc: {
      issues: '(113) total issues',
      pageStates: '(5) total page states',
      accessibilityIssuesCount: 113,
      dropdownAllPageStates: [
        'All page states (5)',
        '[INSERT TITLE HERE] broken-workshop.dequelabs.com/ [unique issues: 12]',
        'Gefälscht~~~Gefälscht CompuTech~~~ abcdcomputech.dequecloud.com/ [unique issues: 29]',
        '[DOCUMENT TITLE] workshop2.dequelabs.com/ [unique issues: 18]',
        'Test File - Clean Page qateam.dequecloud.com/testf... [unique issues: 0]',
        'Gefälscht~~~Gefälscht CompuTech~~~ .../desktops.php [unique issues: 54]'
      ] 
    },
    autoAnalyzeMode: {
      issues: '(200) total issues',
      pageStates: '(8) total page states',
      accessibilityIssuesCount: 200,
    },
    manualMode: {
      issues: '(10) total issues',
      pageStates: '(6) total page states',
      accessibilityIssuesCount: 10
    },
     axeConfigs: {
      issues: '(1) total issues',
      pageStates: '(1) total page states',
      accessibilityIssuesCount: 1
    },
     excludeUrls: {
      issues: '(80) total issues',
      pageStates: '(2) total page states',
      accessibilityIssuesCount: 80
    },
     configOverride: {
      issues: '(10) total issues',
      pageStates: '(1) total page states',
      accessibilityIssuesCount: 10
    },
     wrapMethods: {
      issues: '(1) total issues',
      pageStates: '(2) total page states',
      accessibilityIssuesCount: 1
    },
    dynamicPage: {
      issues: '(29) total issues',
      accessibilityIssuesCount: 29,
      pageStates: '(1) total page states',
      dropdownAllPageStates: [
        'All page states (1)',
        'Gefälscht~~~Gefälscht CompuTech~~~ abcdcomputech.dequecloud.com/ [unique issues: 29]'
      ],
    },
    multiPages: {
      issues: '(49) total issues',
      pageStates: '(11) total page states',
      accessibilityIssuesCount: 49,
      dropdownAllPageStates: [
        'All page states (11)',
        'The Internet .../forgot_password [unique issues: 1]',
        '[no title] .../forgot_password [unique issues: 2]',
        'The Internet the-internet.herokuapp.com/ [unique issues: 44]',
        'The Internet .../login [unique issues: 1]',
        'The Internet .../secure [unique issues: 1]'
      ]
    },
    desktopPage: {
      issues: '(54) total issues',
      pageStates: '(4) total page states',
      accessibilityIssuesCount: 54,
      dropdownAllPageStates: [
        'All page states (4)',
        'Gefälscht~~~Gefälscht CompuTech~~~ abcdcomputech.dequecloud.co... [unique issues: 54]'
      ]
    },
    //Selenium scripts test data
    AutoAnalyzeModeTest: {
      issues: '(30) total issues',
      pageStates: '(7) total page states',
      accessibilityIssuesCount: 30,
      dropdownAllPageStates: [
        'All page states (7)',
        'Mars Commuter: Travel to Mars for Work or Pleasure! dequeuniversity.com/demo/mars/ [unique issues: 24]',
        'Mars Commuter: Travel to Mars for Work or Pleasure! dequeuniversity.com/demo/mars/ [unique issues: 1]',
        'Mars Commuter: Travel to Mars for Work or Pleasure! dequeuniversity.com/demo/mars/ [unique issues: 3]',
        'Mars Commuter: Travel to Mars for Work or Pleasure! dequeuniversity.com/demo/mars/ [unique issues: 1]',
        'Mars Commuter: Travel to Mars for Work or Pleasure! dequeuniversity.com/demo/mars/ [unique issues: 1]'
      ]
    },
    AxeConfigurationsTest: {
      issues: '(6) total issues',
      pageStates: '(10) total page states',
      accessibilityIssuesCount: 6,
      dropdownAllPageStates: [
        'All page states (10)',
        'Test File - Integrations .../attest/api/test.html [unique issues: 5]',
        'Test File - Integrations .../attest/api/test.html [unique issues: 1]'
      ],
    },
    ConfigOverrideTest: {
      issues: '(76) total issues',
      pageStates: '(4) total page states',
      accessibilityIssuesCount: 76,
      dropdownAllPageStates: [
        'All page states (4)',
        'Gefälscht~~~Gefälscht CompuTech~~~ abcdcomputech.dequecloud.com/ [unique issues: 29]',
        'Gefälscht~~~Gefälscht CompuTech~~~ abcdcomputech.dequecloud.com/ [unique issues: 36]',
        'Gefälscht~~~Gefälscht CompuTech~~~ abcdcomputech.dequecloud.com/ [unique issues: 11]'
      ]
    },
    ExcludeUrlTest: {
      issues: '(184) total issues',
      pageStates: '(18) total page states',
      accessibilityIssuesCount: 184,
      dropdownAllPageStates: [
        'All page states (18)',
        'Gefälscht~~~Gefälscht CompuTech~~~ .../cart.php [unique issues: 26]',
        'Gefälscht~~~Gefälscht CompuTech~~~ .../support.php [unique issues: 18]',
        'Gefälscht~~~Gefälscht CompuTech~~~ .../laptopsandnotebooks.php [unique issues: 57]',
        'Gefälscht~~~Gefälscht CompuTech~~~ .../desktops.php [unique issues: 54]',
        'Gefälscht~~~Gefälscht CompuTech~~~ .../cart.php [unique issues: 0]',
        'Gefälscht~~~Gefälscht CompuTech~~~ abcdcomputech.dequecloud.com/ [unique issues: 29]',
        'Gefälscht~~~Gefälscht CompuTech~~~ .../laptopsandnotebooks.php [unique issues: 0]',
        'Gefälscht~~~Gefälscht CompuTech~~~ abcdcomputech.dequecloud.com/ [unique issues: 0]',
        '10    : 1m 8s  Gefälscht~~~Gefälscht CompuTech~~~ .../cart.php [unique issues: 0]',
        '11    : 1m 9s  Gefälscht~~~Gefälscht CompuTech~~~ .../support.php [unique issues: 0]',
        '12    : 1m 10s Gefälscht~~~Gefälscht CompuTech~~~ .../laptopsandnotebooks.php [unique issues: 0]',
        '13    : 1m 12s Gefälscht~~~Gefälscht CompuTech~~~ .../desktops.php [unique issues: 0]',
        '14    : 1m 25s Gefälscht~~~Gefälscht CompuTech~~~ abcdcomputech.dequecloud.com/ [unique issues: 0]',
        '15    : 1m 26s Gefälscht~~~Gefälscht CompuTech~~~ .../support.php [unique issues: 0]',
        '16    : 1m 26s Gefälscht~~~Gefälscht CompuTech~~~ .../cart.php [unique issues: 0]',
        '17    : 1m 28s Gefälscht~~~Gefälscht CompuTech~~~ .../laptopsandnotebooks.php [unique issues: 0]',
        '18    : 1m 30s Gefälscht~~~Gefälscht CompuTech~~~ .../desktops.php [unique issues: 0]'
      ]
    },
    ManualModeTest: {
      issues: '(109) total issues',
      pageStates: '(16) total page states',
      accessibilityIssuesCount: 109,
      dropdownAllPageStates: [
        'All page states (16)',
        'Gefälscht~~~Gefälscht CompuTech~~~ abcdcomputech.dequecloud.com/ [unique issues: 29]',
        'Gefälscht~~~Gefälscht CompuTech~~~ .../cart.php [unique issues: 26]',
        'Gefälscht~~~Gefälscht CompuTech~~~ .../desktops.php [unique issues: 54]'
      ]
    },
    NegativeTest: {
      issues: '(0) total issues',
      pageStates: '(0) total page states',
      accessibilityIssuesCount: 0,
      dropdownAllPageStates: [
        'All page states (1)',
        'Test File - Clean Page qateam.dequecloud.com/testf... [unique issues: 0]'
      ],
    },
    NewBranchTest: {
      issues: '(0) total issues',
      pageStates: '(1) total page states',
      accessibilityIssuesCount: 0,
      dropdownAllPageStates: [
        'All page states (1)',
        'Test File - Clean Page qateam.dequecloud.com/testf... [unique issues: 0]'
      ],
    },
    WrapMethodsTest: {
      issues: '(166) total issues',
      pageStates: '(22) total page states',
      accessibilityIssuesCount: 166,
      dropdownAllPageStates: [
        'All page states (22)',
        'The Internet .../login [unique issues: 1]',
        'The Internet .../secure [unique issues: 1]',
        'Gefälscht~~~Gefälscht CompuTech~~~ abcdcomputech.dequecloud.com/ [unique issues: 29]',
        'Gefälscht~~~Gefälscht CompuTech~~~ .../support.php [unique issues: 18]',
        'Gefälscht~~~Gefälscht CompuTech~~~ .../laptopsandnotebooks.php [unique issues: 57]',
        'Gefälscht~~~Gefälscht CompuTech~~~ .../desktops.php [unique issues: 54]',
        'The Internet .../login [unique issues: 0]',
        'The Internet .../secure [unique issues: 0]',
        'Gefälscht~~~Gefälscht CompuTech~~~ abcdcomputech.dequecloud.com/ [unique issues: 0]',
        'Gefälscht~~~Gefälscht CompuTech~~~ .../support.php [unique issues: 0]',
        'Gefälscht~~~Gefälscht CompuTech~~~ .../laptopsandnotebooks.php [unique issues: 0]',
        'Test File - Integrations .../attest/api/test.html [unique issues: 6]',
        'Gefälscht~~~Gefälscht CompuTech~~~ abcdcomputech.dequecloud.com/ [unique issues: 0]',
        'Gefälscht~~~Gefälscht CompuTech~~~ .../desktops.php [unique issues: 0]',
        'Gefälscht~~~Gefälscht CompuTech~~~ .../support.php [unique issues: 0]',
        'Gefälscht~~~Gefälscht CompuTech~~~ abcdcomputech.dequecloud.com/ [unique issues: 0]',
        'Gefälscht~~~Gefälscht CompuTech~~~ .../desktops.php [unique issues: 0]',
        'Gefälscht~~~Gefälscht CompuTech~~~ .../laptopsandnotebooks.php [unique issues: 0]',
        'Test File - Integrations .../attest/api/test.html [unique issues: 0]'
      ],
    },
  },
  testTitles: {
    brokenWorkshop: '[INSERT TITLE HERE]',
    abcdPage: 'Gefälscht~~~Gefälscht CompuTech~~~',
    testPage: '[DOCUMENT TITLE]',
    cleanPage: 'Test File - Clean Page',
    dequeContactPage: 'Contact Us | Deque Systems',
    marsPage: 'Mars Commuter: Travel to Mars for Work or Pleasure!',
    qaTestPage: 'Test File - Integrations'
  },
  urls: {
    loginPage: getDomain(targetEnvironment),
    healthCheckPage: getDomain(targetEnvironment) + '/healthcheck',
    internalFeatures: getDomain(targetEnvironment) + '/internal/features',
    productsPage: getDomain(targetEnvironment),
    configurationPageUrl: getDomain(targetEnvironment) + '/configuration/axe-devtools-watcher',
    projectsPageUrl: getDomain(targetEnvironment) + '/axe-watcher/projects',
    startupPageUrl: getDomain(targetEnvironment) + '/axe-watcher/startup',
    viewDocumentationLink: 'https://docs.deque.com/developer-hub/2/en/dh-get-started',
    welcomePage: getDomain(targetEnvironment) + '/axe-devtools',
    signUpPage: getDomain(targetEnvironment) + '/signup',
    userAccess: getDomain(targetEnvironment) + '/user-access',
    loginPageAuth: getLoginPageAuth(targetEnvironment),
    editMyInformation: getEditMyInformationPage(targetEnvironment),
    settings: getDomain(targetEnvironment) + '/settings',
    sendFeedback: 'https://www.surveymonkey.com/r/KXJJ375'
    
  },
  testUrls: {
    marsPage: 'https://dequeuniversity.com/demo/mars/',
    abcdPage: 'http://abcdcomputech.dequecloud.com',
    abcdLaptopsAndNotebooks: 'https://abcdcomputech.dequecloud.com/laptopsandnotebooks.php',
    abcdSupport: 'https://abcdcomputech.dequecloud.com/support.php',
    abcdDesktop: 'http://abcdcomputech.dequecloud.com/desktops.php',
    abcdCart: 'http://abcdcomputech.dequecloud.com/cart.php',
    testPage: 'https://workshop2.dequelabs.com/',
    cleanPage: 'https://qateam.dequecloud.com/testfiles/cleanpage.html',
    twoKIssuesPage: 'https://qateam.dequecloud.com/testfiles/2kcolorissues.html',
    dequeContact: 'https://www.deque.com/company/contact/',
    brokenWorkshop: 'https://broken-workshop.dequelabs.com/',
    ariaHiddenPage: 'https://qateam.dequecloud.com/testfiles/aria-hidden-focus.html',
    forgotPassword: 'https://the-internet.herokuapp.com/forgot_password',
    herokuLogin: 'https://the-internet.herokuapp.com/login',
    heroku: 'https://the-internet.herokuapp.com',
    qaTestPage:'https://qateam.dequecloud.com/attest/api/test.html',
    actions:'https://qateam.dequecloud.com/testfiles/CypressActions.html'
  },
  messages: {
    configurationToast: '',
    branchesShareToast: 'Branches URL copied to clipboard',
    commitsShareToast: 'The URL has been copied to your clipboard',
    issuesPageShareProjectToast: 'The URL has been copied to your clipboard',
    shareIssueToast: 'Issue has been copied to your clipboard',
    projectsPageAPIKeyToast: 'Copied API key to clipboard',
    sendFeedback: 'We would appreciate your feedback to improve the experience!'
  },
  userData: {
    firstName: 'Gayathri',
    lastName: 'Tungala',
    fullName: 'Gayathri Tungala',
    email: 'gayathri.tungala@deque.com',
    companyName: 'Deque',
    password: 'Password@123',
    confirmPassword: 'Password@123'
  },
  userAccessStatus: {
    emailSent: 'Email sent',
    activeUser: 'Active user'
  },
  dequeEmail: {
    userActivationNotification: 'wsonline@deque.com'
  },
  products: {
    axeWatcher: 'axe-devtools-watcher'
  },
  testUsers: {
    entUserName: 'gayathri.tungala+qa_automation_admin290823@deque.com',
    password: 'Password@123',
    entAdminUserName: 'padmavathi.vemulapati+qatester_08052023_2@deque.com',
    entUser: 'gayathri.tungala+qa_automation_user290823@deque.com'
  },
  productAccess: {
    watcher: 'axe Developer Hub: General Access',
    admin: 'axe Account: Admin',
    axeAccount: 'axe Account: General Access'
  },
  textValidations: {
    timeStamp: 'scanned a few seconds ago',
    timeStampForMin: 'scanned a minute ago',
    timeStampForTwo: 'scanned 2 minutes ago',
    timeStampForThree: 'scanned 3 minutes ago',
    defaultTag: 'Default',
    mainBranch: 'main',
    nonDefaultBranch: 'branch',
    mainBranchTestId: 'default-branch',
    noDefaultBranch: 'Please run axe Watcher on your default branch to unlock comparison data'
  },
  instructionHeaderText: {
    cypress: '4. Set up instructions for Cypress',
    playwrightTest: '4. Set up instructions for Playwright Test',
    playwright: '4. Set up instructions for Playwright',
    puppeteer: '4. Set up instructions for Puppeteer',
    webdriverIO: '4. Set up instructions for WebdriverIO',
    webdriverIOTestrunner: '4. Set up instructions for WebdriverIO Testrunner',
    webDriverJS: '4. Set up instructions for WebDriverJS'
  },
  platforms: {
    cypress: 'Cypress',
    playwrightTest: 'Playwright Test',
    playwright: 'Playwright',
    puppeteer: 'Puppeteer',
    webdriverIO: 'WebdriverIO',
    webdriverIOTestrunner: 'WebdriverIO Testrunner',
    webDriverJS: 'WebDriverJS'
  },
  ruleNames: {
    colorContrast: 'Elements must meet minimum color contrast ratio thresholds',
    imageAlt: 'Images must have alternate text',
    label: 'Form elements must have labels',
    linkInTextBlock: 'Links must be distinguishable without relying on color',
    linkName: 'Links must have discernible text'
  },
  ruleIDs: {
    colorContrast: 'color-contrast',
    imageAlt: 'image-alt',
    label: 'label',
    linkInTextBlock: 'link-in-text-block',
    linkName: 'link-name'
  },
  abcdPageRuleIssuesCount: {
    colorContrast: '13 issues',
    imageAlt: '8 issues',
    label: '1 issue',
    linkInTextBlock: '2 issues',
    linkName: '5 issues'
  },
  ruleData: {
    pageState: 'abcdcomputech.dequecloud.com/',
    ccIssueDesc:
      'Ensures the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds',
    ccSelector: '#header > .fl_left > p',
    ccElementSource: '<p>Gefälscht CompuTech</p>',
    ccImpact: 'Serious',
    ccMoreInfo: 'https://dequeuniversity.com/rules/axe/4.10/color-contrast?application=axeAPI',
    issueDesc: 'Ensures <img> elements have alternate text or a role of none or presentation',
    selector: 'img[src$="small60-1.jpg"]',
    elementSource: '<img class="imgl" src="images/site/small60-1.jpg">',
    impact: 'Critical',
    moreInfo: 'https://dequeuniversity.com/rules/axe/4.10/image-alt?application=axeAPI'
  },
  abcdPageValidations: {
    issuesCount: '(29) total issues',
    pageState: '(1) total page states',
    ddAllPageState: 'All page states (1)',
    pageStateDDValue: 'abcdcomputech.dequecloud.com/',
    a11yIssuesCount: '29'
  },
  values: {
    num1: 1
  },
  multiPage: {
    emailTextbox: '#email',
    emailValue: 'person@place.biz',
    submitButton: 'button[type="submit"]',
    title: 'The Internet',
    links: 'ul li a',
    loginLink: 'ul li a[href="/login"]',
    headerSelector: 'h2',
    username: '#username',
    usernameValue: 'tomsmith',
    password: '#password',
    passwordValue: 'SuperSecretPassword!',
    herokuSubmit: 'button[type="submit"]',
    flashSelector: '#flash',
    issuesCount: '(49) total issues',
    pageState: '(11) total page states',
    ddAllPageState: 'All page states (11)',
    a11yIssuesCount: '49',
    cypressIssuesCount1: '(47) total issues',
    cypressIssuesCount2: '(51) total issues',
    cypressPageState: '(5) total page states',
    cypressDdAllPageState: 'All page states (5)',
    wdjsIssuesCount: '(49) total issues',
    wdjsPageState: '(8) total page states',
    wdjsDdAllPageState: 'All page states (8)',
    wdjsA11yIssuesCount: '49',
    securePage: '/secure',
    length: '20'
  },
  multiitsManual:{
    issuesCount: '(84) total issues',
    pageState: '(6) total page states',
    accessibilityIssuesCount: 84,
    dropdownAllPageStates: [
      'All page states (6)',
      '[INSERT TITLE HERE] broken-workshop.dequelabs.com/ [unique issues: 12]',
      '[DOCUMENT TITLE] workshop2.dequelabs.com/ [unique issues: 18]',
      'Gefälscht~~~Gefälscht CompuTech~~~ abcdcomputech.dequecloud.co... [unique issues: 54]'
    ],
  },
  herokuManual:{
    issuesCount: '(1) total issues',
    pageState: '(2) total page states',
    accessibilityIssuesCount: 1,
    dropdownAllPageStates: [
      'All page states (2)',
      'The Internet the-internet.herokuapp.com/... [unique issues: 1]'
    ],
  },
  configurationTestsValidations: {
    abcdPageSelectors:{
      laptopsAndNotebooks: "a[href='/laptopsandnotebooks.php']",
      desktops:"a[href='/desktops.php']",
      cart:"a[href='/cart.php']",
      support: "a[href='/support.php']",
      contact: "a[href='/contact.php']"
    },
    dynamicPageSelectors:{ 
      activitiesLabel: "#widget-controls-activities-label",
      passesLabel: "#widget-controls-passes-label",
      hotelsLabel: "#widget-controls-hotels-label",
      reservationsLabel: "#widget-controls-reservations-label",
      roundtripRadioButton: "#route-type-radio-group > span:nth-child(2) > label"
    },
    disableRuleTests: {
      issues: '(10) total issues',
      pageStates: '(1) total page states',
      accessibilityIssuesCount: 10,
      dropdownAllPageStates: [
        'All page states (1)',
        '[DOCUMENT TITLE] workshop2.dequelabs.com/ [unique issues: 10]'
      ],
      pageStateDropdownValue: 'broken-workshop.dequelabs.com/',
      issuesDetails: {
        'image-alt': '8 issues',
        'link-name': '2 issues'
      }
    },

    excludeContextConfigTests: {
      issues: '(5) total issues',
      pageStates: '(1) total page states',
      accessibilityIssuesCount: 5,
      dropdownAllPageStates: [
        'All page states (1)',
        'Test File - Integrations qateam.dequecloud.com/attes... [unique issues: 5]'
      ],
      issuesDetails: {
        'aria-allowed-attr': '1 issue',
        'autocomplete-valid': '1 issue',
        'label': '1 issue',
        'link-in-text-block': '2 issues'
      }
    },
    multipleUrlsPatternConfigTests: {
      issues: '(55) total issues',
      pageStates: '(2) total page states',
      accessibilityIssuesCount: 55,
      dropdownAllPageStates: [
        'All page states (2)',
        "Gefälscht~~~Gefälscht CompuTech~~~ abcdcomputech.dequecloud.com/ [unique issues: 29]",
        "Gefälscht~~~Gefälscht CompuTech~~~ .../cart.php [unique issues: 26]",
      ],
    },
    singleUrlPatternConfigTests: {
      issues: '(166) total issues',
      pageStates: '(4) total page states',
      accessibilityIssuesCount: 166,
      dropdownAllPageStates: [
        'All page states (4)',
        "Gefälscht~~~Gefälscht CompuTech~~~ abcdcomputech.dequecloud.com/ [unique issues: 29]",
        "Gefälscht~~~Gefälscht CompuTech~~~ .../laptopsandnotebooks.php [unique issues: 57]",
        "Gefälscht~~~Gefälscht CompuTech~~~ .../desktops.php [unique issues: 54]",
        "Gefälscht~~~Gefälscht CompuTech~~~ .../cart.php [unique issues: 26]",
      ],
    },
    includeContextConfigTests: {
      issues: '(1) total issues',
      pageStates: '(1) total page states',
      accessibilityIssuesCount: 1,
      dropdownAllPageStates: [
        'All page states (1)',
        'Test File - Integrations qateam.dequecloud.com/attes... [unique issues: 1]'
      ],
      issuesDetails: {
        'color-contrast': '1 issue'
      }
    },
    multiItsExlcudeUrlsConfigTests: {
      issues: '(59) total issues',
      pageStates: '(3) total page states',
      accessibilityIssuesCount: 59,
      dropdownAllPageStates: [
        'All page states (3)',
        "Gefälscht~~~Gefälscht CompuTech~~~ abcdcomputech.dequecloud.com/ [unique issues: 29]",
        '[INSERT TITLE HERE] broken-workshop.dequelabs.com/ [unique issues: 12]',
        '[DOCUMENT TITLE] workshop2.dequelabs.com/ [unique issues: 18]'
      ],
    },
    runOptionsConfigTests: {
      issues: '(10) total issues',
      pageStates: '(1) total page states',
      accessibilityIssuesCount: 10,
      dropdownAllPageStates: [
        'All page states (1)',
        "Gefälscht~~~Gefälscht CompuTech~~~ abcdcomputech.dequecloud.com/ [unique issues: 10]",
      ],
      issuesDetails: {
        'target-size': '10 issues'
      },
      warningMessage: "This scan was created using runOptions. This may not be aligned with your organization's global configurations."
    },
    rulesAndTagOptionsConfigTests:{
      issues: '(1) total issues',
      pageStates: '(1) total page states',
      accessibilityIssuesCount: 1,
      dropdownAllPageStates: [
        'All page states (1)',
        "Test File - Integrations qateam.dequelabs.com/attes... [unique issues: 1]",
      ],
      issuesDetails: {
        'autocomplete-valid': '1 issue'
      },
    }
  }
};
