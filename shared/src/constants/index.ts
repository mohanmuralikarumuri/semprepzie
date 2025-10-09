// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    SIGNUP: '/api/auth/signup',
    VERIFY_TOKEN: '/api/auth/verify-token',
    REFRESH_TOKEN: '/api/auth/refresh',
    RESET_PASSWORD: '/api/auth/reset-password',
    PROFILE: '/api/auth/profile',
  },
  
  // Documents
  DOCUMENTS: {
    LIST: '/api/documents',
    UPLOAD: '/api/documents/upload',
    VIEW: '/api/documents/view',
    DELETE: '/api/documents',
    METADATA: '/api/documents/metadata',
  },
  
  // Contact
  CONTACT: {
    SUBMIT: '/api/contact',
  },
  
  // Device Management
  DEVICES: {
    REGISTER: '/api/devices/register',
    LIST: '/api/devices',
    REVOKE: '/api/devices/revoke',
    CHECK_COUNT: '/api/devices/count',
  },
  
  // Lab Management
  LAB: {
    LIST_SUBJECTS: '/api/lab/subjects',
    GET_SUBJECT: '/api/lab/subjects/:id',
    CREATE_SUBJECT: '/api/lab/subjects',
    UPDATE_SUBJECT: '/api/lab/subjects/:id',
    DELETE_SUBJECT: '/api/lab/subjects/:id',
    EXECUTE_CODE: '/api/lab/execute',
    SAVE_CODE: '/api/lab/save',
    GET_CODE: '/api/lab/code/:id',
  },
  
  // Health Check
  HEALTH: '/api/health',
} as const;

// Application Configuration
export const APP_CONFIG = {
  NAME: 'Semprepzie',
  VERSION: '2.0.0',
  DESCRIPTION: 'Educational Document Management System',
  
  // Email Domain Restriction
  ALLOWED_EMAIL_DOMAIN: '@aitsrajampet.ac.in',
  
  // Valid student numbers for authentication (0501 to 05Z9)
  VALID_STUDENT_NUMBERS: [
    // 0501-050Z
    '0501', '0502', '0503', '0504', '0505', '0506', '0507', '0508', '0509', '050A', '050B', '050C', '050D', '050E', '050F', '050G', '050H', '050I', '050J', '050K', '050L', '050M', '050N', '050O', '050P', '050Q', '050R', '050S', '050T', '050U', '050V', '050W', '050X', '050Y', '050Z',
    // 0510-051Z
    '0510', '0511', '0512', '0513', '0514', '0515', '0516', '0517', '0518', '0519', '051A', '051B', '051C', '051D', '051E', '051F', '051G', '051H', '051I', '051J', '051K', '051L', '051M', '051N', '051O', '051P', '051Q', '051R', '051S', '051T', '051U', '051V', '051W', '051X', '051Y', '051Z',
    // 0520-052Z
    '0520', '0521', '0522', '0523', '0524', '0525', '0526', '0527', '0528', '0529', '052A', '052B', '052C', '052D', '052E', '052F', '052G', '052H', '052I', '052J', '052K', '052L', '052M', '052N', '052O', '052P', '052Q', '052R', '052S', '052T', '052U', '052V', '052W', '052X', '052Y', '052Z',
    // 0530-053Z
    '0530', '0531', '0532', '0533', '0534', '0535', '0536', '0537', '0538', '0539', '053A', '053B', '053C', '053D', '053E', '053F', '053G', '053H', '053I', '053J', '053K', '053L', '053M', '053N', '053O', '053P', '053Q', '053R', '053S', '053T', '053U', '053V', '053W', '053X', '053Y', '053Z',
    // 0540-054Z
    '0540', '0541', '0542', '0543', '0544', '0545', '0546', '0547', '0548', '0549', '054A', '054B', '054C', '054D', '054E', '054F', '054G', '054H', '054I', '054J', '054K', '054L', '054M', '054N', '054O', '054P', '054Q', '054R', '054S', '054T', '054U', '054V', '054W', '054X', '054Y', '054Z',
    // 0550-055Z
    '0550', '0551', '0552', '0553', '0554', '0555', '0556', '0557', '0558', '0559', '055A', '055B', '055C', '055D', '055E', '055F', '055G', '055H', '055I', '055J', '055K', '055L', '055M', '055N', '055O', '055P', '055Q', '055R', '055S', '055T', '055U', '055V', '055W', '055X', '055Y', '055Z',
    // 0560-056Z
    '0560', '0561', '0562', '0563', '0564', '0565', '0566', '0567', '0568', '0569', '056A', '056B', '056C', '056D', '056E', '056F', '056G', '056H', '056I', '056J', '056K', '056L', '056M', '056N', '056O', '056P', '056Q', '056R', '056S', '056T', '056U', '056V', '056W', '056X', '056Y', '056Z',
    // 0570-057Z
    '0570', '0571', '0572', '0573', '0574', '0575', '0576', '0577', '0578', '0579', '057A', '057B', '057C', '057D', '057E', '057F', '057G', '057H', '057I', '057J', '057K', '057L', '057M', '057N', '057O', '057P', '057Q', '057R', '057S', '057T', '057U', '057V', '057W', '057X', '057Y', '057Z',
    // 0580-058Z
    '0580', '0581', '0582', '0583', '0584', '0585', '0586', '0587', '0588', '0589', '058A', '058B', '058C', '058D', '058E', '058F', '058G', '058H', '058I', '058J', '058K', '058L', '058M', '058N', '058O', '058P', '058Q', '058R', '058S', '058T', '058U', '058V', '058W', '058X', '058Y', '058Z',
    // 0590-059Z
    '0590', '0591', '0592', '0593', '0594', '0595', '0596', '0597', '0598', '0599', '059A', '059B', '059C', '059D', '059E', '059F', '059G', '059H', '059I', '059J', '059K', '059L', '059M', '059N', '059O', '059P', '059Q', '059R', '059S', '059T', '059U', '059V', '059W', '059X', '059Y', '059Z',
    // 05A0-05AZ
    '05A0', '05A1', '05A2', '05A3', '05A4', '05A5', '05A6', '05A7', '05A8', '05A9', '05AA', '05AB', '05AC', '05AD', '05AE', '05AF', '05AG', '05AH', '05AI', '05AJ', '05AK', '05AL', '05AM', '05AN', '05AO', '05AP', '05AQ', '05AR', '05AS', '05AT', '05AU', '05AV', '05AW', '05AX', '05AY', '05AZ',
    // 05B0-05BZ
    '05B0', '05B1', '05B2', '05B3', '05B4', '05B5', '05B6', '05B7', '05B8', '05B9', '05BA', '05BB', '05BC', '05BD', '05BE', '05BF', '05BG', '05BH', '05BI', '05BJ', '05BK', '05BL', '05BM', '05BN', '05BO', '05BP', '05BQ', '05BR', '05BS', '05BT', '05BU', '05BV', '05BW', '05BX', '05BY', '05BZ',
    // 05C0-05CZ
    '05C0', '05C1', '05C2', '05C3', '05C4', '05C5', '05C6', '05C7', '05C8', '05C9', '05CA', '05CB', '05CC', '05CD', '05CE', '05CF', '05CG', '05CH', '05CI', '05CJ', '05CK', '05CL', '05CM', '05CN', '05CO', '05CP', '05CQ', '05CR', '05CS', '05CT', '05CU', '05CV', '05CW', '05CX', '05CY', '05CZ',
    // 05D0-05DZ
    '05D0', '05D1', '05D2', '05D3', '05D4', '05D5', '05D6', '05D7', '05D8', '05D9', '05DA', '05DB', '05DC', '05DD', '05DE', '05DF', '05DG', '05DH', '05DI', '05DJ', '05DK', '05DL', '05DM', '05DN', '05DO', '05DP', '05DQ', '05DR', '05DS', '05DT', '05DU', '05DV', '05DW', '05DX', '05DY', '05DZ',
    // 05E0-05EZ
    '05E0', '05E1', '05E2', '05E3', '05E4', '05E5', '05E6', '05E7', '05E8', '05E9', '05EA', '05EB', '05EC', '05ED', '05EE', '05EF', '05EG', '05EH', '05EI', '05EJ', '05EK', '05EL', '05EM', '05EN', '05EO', '05EP', '05EQ', '05ER', '05ES', '05ET', '05EU', '05EV', '05EW', '05EX', '05EY', '05EZ',
    // 05F0-05FZ
    '05F0', '05F1', '05F2', '05F3', '05F4', '05F5', '05F6', '05F7', '05F8', '05F9', '05FA', '05FB', '05FC', '05FD', '05FE', '05FF', '05FG', '05FH', '05FI', '05FJ', '05FK', '05FL', '05FM', '05FN', '05FO', '05FP', '05FQ', '05FR', '05FS', '05FT', '05FU', '05FV', '05FW', '05FX', '05FY', '05FZ',
    // 05G0-05GZ
    '05G0', '05G1', '05G2', '05G3', '05G4', '05G5', '05G6', '05G7', '05G8', '05G9', '05GA', '05GB', '05GC', '05GD', '05GE', '05GF', '05GG', '05GH', '05GI', '05GJ', '05GK', '05GL', '05GM', '05GN', '05GO', '05GP', '05GQ', '05GR', '05GS', '05GT', '05GU', '05GV', '05GW', '05GX', '05GY', '05GZ',
    // 05H0-05HZ
    '05H0', '05H1', '05H2', '05H3', '05H4', '05H5', '05H6', '05H7', '05H8', '05H9', '05HA', '05HB', '05HC', '05HD', '05HE', '05HF', '05HG', '05HH', '05HI', '05HJ', '05HK', '05HL', '05HM', '05HN', '05HO', '05HP', '05HQ', '05HR', '05HS', '05HT', '05HU', '05HV', '05HW', '05HX', '05HY', '05HZ',
    // 05I0-05IZ
    '05I0', '05I1', '05I2', '05I3', '05I4', '05I5', '05I6', '05I7', '05I8', '05I9', '05IA', '05IB', '05IC', '05ID', '05IE', '05IF', '05IG', '05IH', '05II', '05IJ', '05IK', '05IL', '05IM', '05IN', '05IO', '05IP', '05IQ', '05IR', '05IS', '05IT', '05IU', '05IV', '05IW', '05IX', '05IY', '05IZ',
    // 05J0-05JZ
    '05J0', '05J1', '05J2', '05J3', '05J4', '05J5', '05J6', '05J7', '05J8', '05J9', '05JA', '05JB', '05JC', '05JD', '05JE', '05JF', '05JG', '05JH', '05JI', '05JJ', '05JK', '05JL', '05JM', '05JN', '05JO', '05JP', '05JQ', '05JR', '05JS', '05JT', '05JU', '05JV', '05JW', '05JX', '05JY', '05JZ',
    // 05K0-05KZ
    '05K0', '05K1', '05K2', '05K3', '05K4', '05K5', '05K6', '05K7', '05K8', '05K9', '05KA', '05KB', '05KC', '05KD', '05KE', '05KF', '05KG', '05KH', '05KI', '05KJ', '05KK', '05KL', '05KM', '05KN', '05KO', '05KP', '05KQ', '05KR', '05KS', '05KT', '05KU', '05KV', '05KW', '05KX', '05KY', '05KZ',
    // 05L0-05LZ
    '05L0', '05L1', '05L2', '05L3', '05L4', '05L5', '05L6', '05L7', '05L8', '05L9', '05LA', '05LB', '05LC', '05LD', '05LE', '05LF', '05LG', '05LH', '05LI', '05LJ', '05LK', '05LL', '05LM', '05LN', '05LO', '05LP', '05LQ', '05LR', '05LS', '05LT', '05LU', '05LV', '05LW', '05LX', '05LY', '05LZ',
    // 05M0-05MZ
    '05M0', '05M1', '05M2', '05M3', '05M4', '05M5', '05M6', '05M7', '05M8', '05M9', '05MA', '05MB', '05MC', '05MD', '05ME', '05MF', '05MG', '05MH', '05MI', '05MJ', '05MK', '05ML', '05MM', '05MN', '05MO', '05MP', '05MQ', '05MR', '05MS', '05MT', '05MU', '05MV', '05MW', '05MX', '05MY', '05MZ',
    // 05N0-05NZ
    '05N0', '05N1', '05N2', '05N3', '05N4', '05N5', '05N6', '05N7', '05N8', '05N9', '05NA', '05NB', '05NC', '05ND', '05NE', '05NF', '05NG', '05NH', '05NI', '05NJ', '05NK', '05NL', '05NM', '05NN', '05NO', '05NP', '05NQ', '05NR', '05NS', '05NT', '05NU', '05NV', '05NW', '05NX', '05NY', '05NZ',
    // 05O0-05OZ
    '05O0', '05O1', '05O2', '05O3', '05O4', '05O5', '05O6', '05O7', '05O8', '05O9', '05OA', '05OB', '05OC', '05OD', '05OE', '05OF', '05OG', '05OH', '05OI', '05OJ', '05OK', '05OL', '05OM', '05ON', '05OO', '05OP', '05OQ', '05OR', '05OS', '05OT', '05OU', '05OV', '05OW', '05OX', '05OY', '05OZ',
    // 05P0-05PZ
    '05P0', '05P1', '05P2', '05P3', '05P4', '05P5', '05P6', '05P7', '05P8', '05P9', '05PA', '05PB', '05PC', '05PD', '05PE', '05PF', '05PG', '05PH', '05PI', '05PJ', '05PK', '05PL', '05PM', '05PN', '05PO', '05PP', '05PQ', '05PR', '05PS', '05PT', '05PU', '05PV', '05PW', '05PX', '05PY', '05PZ',
    // 05Q0-05QZ
    '05Q0', '05Q1', '05Q2', '05Q3', '05Q4', '05Q5', '05Q6', '05Q7', '05Q8', '05Q9', '05QA', '05QB', '05QC', '05QD', '05QE', '05QF', '05QG', '05QH', '05QI', '05QJ', '05QK', '05QL', '05QM', '05QN', '05QO', '05QP', '05QQ', '05QR', '05QS', '05QT', '05QU', '05QV', '05QW', '05QX', '05QY', '05QZ',
    // 05R0-05RZ
    '05R0', '05R1', '05R2', '05R3', '05R4', '05R5', '05R6', '05R7', '05R8', '05R9', '05RA', '05RB', '05RC', '05RD', '05RE', '05RF', '05RG', '05RH', '05RI', '05RJ', '05RK', '05RL', '05RM', '05RN', '05RO', '05RP', '05RQ', '05RR', '05RS', '05RT', '05RU', '05RV', '05RW', '05RX', '05RY', '05RZ',
    // 05S0-05SZ
    '05S0', '05S1', '05S2', '05S3', '05S4', '05S5', '05S6', '05S7', '05S8', '05S9', '05SA', '05SB', '05SC', '05SD', '05SE', '05SF', '05SG', '05SH', '05SI', '05SJ', '05SK', '05SL', '05SM', '05SN', '05SO', '05SP', '05SQ', '05SR', '05SS', '05ST', '05SU', '05SV', '05SW', '05SX', '05SY', '05SZ',
    // 05T0-05TZ
    '05T0', '05T1', '05T2', '05T3', '05T4', '05T5', '05T6', '05T7', '05T8', '05T9', '05TA', '05TB', '05TC', '05TD', '05TE', '05TF', '05TG', '05TH', '05TI', '05TJ', '05TK', '05TL', '05TM', '05TN', '05TO', '05TP', '05TQ', '05TR', '05TS', '05TT', '05TU', '05TV', '05TW', '05TX', '05TY', '05TZ',
    // 05U0-05UZ
    '05U0', '05U1', '05U2', '05U3', '05U4', '05U5', '05U6', '05U7', '05U8', '05U9', '05UA', '05UB', '05UC', '05UD', '05UE', '05UF', '05UG', '05UH', '05UI', '05UJ', '05UK', '05UL', '05UM', '05UN', '05UO', '05UP', '05UQ', '05UR', '05US', '05UT', '05UU', '05UV', '05UW', '05UX', '05UY', '05UZ',
    // 05V0-05VZ
    '05V0', '05V1', '05V2', '05V3', '05V4', '05V5', '05V6', '05V7', '05V8', '05V9', '05VA', '05VB', '05VC', '05VD', '05VE', '05VF', '05VG', '05VH', '05VI', '05VJ', '05VK', '05VL', '05VM', '05VN', '05VO', '05VP', '05VQ', '05VR', '05VS', '05VT', '05VU', '05VV', '05VW', '05VX', '05VY', '05VZ',
    // 05W0-05WZ
    '05W0', '05W1', '05W2', '05W3', '05W4', '05W5', '05W6', '05W7', '05W8', '05W9', '05WA', '05WB', '05WC', '05WD', '05WE', '05WF', '05WG', '05WH', '05WI', '05WJ', '05WK', '05WL', '05WM', '05WN', '05WO', '05WP', '05WQ', '05WR', '05WS', '05WT', '05WU', '05WV', '05WW', '05WX', '05WY', '05WZ',
    // 05X0-05XZ
    '05X0', '05X1', '05X2', '05X3', '05X4', '05X5', '05X6', '05X7', '05X8', '05X9', '05XA', '05XB', '05XC', '05XD', '05XE', '05XF', '05XG', '05XH', '05XI', '05XJ', '05XK', '05XL', '05XM', '05XN', '05XO', '05XP', '05XQ', '05XR', '05XS', '05XT', '05XU', '05XV', '05XW', '05XX', '05XY', '05XZ',
    // 05Y0-05YZ
    '05Y0', '05Y1', '05Y2', '05Y3', '05Y4', '05Y5', '05Y6', '05Y7', '05Y8', '05Y9', '05YA', '05YB', '05YC', '05YD', '05YE', '05YF', '05YG', '05YH', '05YI', '05YJ', '05YK', '05YL', '05YM', '05YN', '05YO', '05YP', '05YQ', '05YR', '05YS', '05YT', '05YU', '05YV', '05YW', '05YX', '05YY', '05YZ',
    // 05Z0-05Z9
    '05Z0', '05Z1', '05Z2', '05Z3', '05Z4', '05Z5', '05Z6', '05Z7', '05Z8', '05Z9'
  ],
  
  // File Upload Limits
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_FILE_TYPES: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'],
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
    CONTACT_FORM_MAX: 5,
  },
  
  // Session Configuration
  SESSION: {
    DURATION: 24 * 60 * 60 * 1000, // 24 hours
    REFRESH_THRESHOLD: 60 * 60 * 1000, // 1 hour
  },
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 254,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: false,
    REQUIRE_LOWERCASE: false,
    REQUIRE_NUMBER: false,
    REQUIRE_SPECIAL: false,
  },
  
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s'-]+$/,
  },
  
  MESSAGE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 1000,
  },
  
  DOCUMENT_TITLE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication Errors
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_NOT_VERIFIED: 'Please verify your email address',
    ACCOUNT_DISABLED: 'Your account has been disabled',
    TOO_MANY_ATTEMPTS: 'Too many failed attempts. Please try again later',
    WEAK_PASSWORD: 'Password is too weak. Please choose a stronger password',
    EMAIL_EXISTS: 'An account with this email already exists',
    USER_NOT_FOUND: 'No account found with this email address',
    INVALID_TOKEN: 'Invalid or expired token',
    UNAUTHORIZED: 'You are not authorized to access this resource',
  },
  
  // Validation Errors
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_DOMAIN: 'Email must be from @aitsrajampet.ac.in domain',
    PASSWORD_TOO_SHORT: 'Password must be at least 6 characters long',
    NAME_TOO_SHORT: 'Name must be at least 2 characters long',
    MESSAGE_TOO_SHORT: 'Message must be at least 10 characters long',
    MESSAGE_TOO_LONG: 'Message cannot exceed 1000 characters',
    INVALID_FILE_TYPE: 'File type not supported',
    FILE_TOO_LARGE: 'File size exceeds the maximum limit',
  },
  
  // Network Errors
  NETWORK: {
    CONNECTION_ERROR: 'Unable to connect to the server. Please check your internet connection',
    SERVER_ERROR: 'Server error occurred. Please try again later',
    TIMEOUT: 'Request timed out. Please try again',
    NOT_FOUND: 'The requested resource was not found',
  },
  
  // Document Errors
  DOCUMENTS: {
    UPLOAD_FAILED: 'Failed to upload document',
    NOT_FOUND: 'Document not found',
    ACCESS_DENIED: 'You do not have permission to access this document',
    PROCESSING_ERROR: 'Error processing document',
  },
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Successfully logged in',
    LOGOUT_SUCCESS: 'Successfully logged out',
    SIGNUP_SUCCESS: 'Account created successfully. Please verify your email',
    PASSWORD_RESET_SENT: 'Password reset link sent to your email',
    PASSWORD_RESET_SUCCESS: 'Password reset successfully',
    EMAIL_VERIFIED: 'Email verified successfully',
  },
  
  CONTACT: {
    MESSAGE_SENT: 'Your message has been sent successfully',
  },
  
  DOCUMENTS: {
    UPLOAD_SUCCESS: 'Document uploaded successfully',
    DELETE_SUCCESS: 'Document deleted successfully',
  },
} as const;

// Document Viewer Configuration
export const DOCUMENT_VIEWER = {
  // PDF.js Configuration
  PDFJS: {
    WORKER_SRC: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
    DEFAULT_SCALE: 1.2,
    MAX_SCALE: 3.0,
    MIN_SCALE: 0.5,
  },
  
  // Microsoft Office Online Viewer URLs
  OFFICE_VIEWER: {
    BASE_URL: 'https://view.officeapps.live.com/op/embed.aspx',
    SUPPORTED_TYPES: ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'],
  },
  
  // Google Drive Viewer
  GOOGLE_DRIVE: {
    VIEWER_URL: 'https://drive.google.com/file/d/{FILE_ID}/preview',
    DOWNLOAD_URL: 'https://drive.google.com/uc?id={FILE_ID}&export=download',
  },
} as const;

// UI Constants
export const UI_CONSTANTS = {
  // Animation Durations (in milliseconds)
  ANIMATION: {
    FAST: 150,
    NORMAL: 250,
    SLOW: 400,
  },
  
  // Breakpoints (Tailwind CSS)
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
  },
  
  // Z-Index Layers
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    NOTIFICATION: 1080,
  },
} as const;

// Lab Configuration
export const LAB_CONFIG = {
  // Supported Programming Languages
  LANGUAGES: {
    C: {
      id: 'c',
      name: 'C',
      extension: '.c',
      defaultCode: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
      compiler: 'gcc',
    },
    JAVA: {
      id: 'java',
      name: 'Java',
      extension: '.java',
      defaultCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
      compiler: 'javac',
    },
    PYTHON: {
      id: 'python',
      name: 'Python',
      extension: '.py',
      defaultCode: `# Python with libraries support
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

print("Hello, World!")
print("NumPy version:", np.__version__)
print("Pandas version:", pd.__version__)
print("Matplotlib version:", plt.matplotlib.__version__)`,
      compiler: 'python3',
      libraries: ['numpy', 'pandas', 'matplotlib', 'scipy', 'requests', 'json', 'os', 'sys', 'math'],
    },
  },
  
  // Code Editor Theme
  EDITOR_THEME: {
    BACKGROUND: '#1a1a1a',
    TEXT_COLOR: '#ffffff',
    ERROR_COLOR: '#ff6b6b',
    COPY_COLOR: '#4dabf7',
    SELECTION_COLOR: '#4c6ef5',
    LINE_NUMBER_COLOR: '#6c757d',
    COMMENT_COLOR: '#6c757d',
    KEYWORD_COLOR: '#51cf66',
    STRING_COLOR: '#ffd43b',
    FUNCTION_COLOR: '#74c0fc',
  },
  
  // Execution Limits
  EXECUTION: {
    TIMEOUT: 30000, // 30 seconds
    MEMORY_LIMIT: '128MB',
    MAX_OUTPUT_SIZE: 10000, // 10KB
  },
} as const;
