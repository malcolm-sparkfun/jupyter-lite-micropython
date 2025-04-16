export const globalStyles = `
  :root {
    --ui-red: #FF3B30;
    --ui-red-dark: #E0321F;
    --ui-red-light: #FF6961;
    --ui-navy: #0A192F;
    --ui-navy-light: #2D2D3A;
    --ui-white: #FFFFFF;
    --ui-gray: #8E8E93;
    --ui-gray-light: #F2F2F7;
    --ui-shadow-sm: 0 2px 8px rgba(28, 28, 40, 0.08);
    --ui-shadow-md: 0 8px 24px rgba(28, 28, 40, 0.12);
    --ui-shadow-lg: 0 20px 40px rgba(28, 28, 40, 0.16);
  }
`;

export const animations = `
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

export const overlayStyles = `
  .welcome-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    opacity: 1;
    transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
  }

  .jp-kernel-welcome-panel.visible .welcome-overlay {
    opacity: 1;
    visibility: visible;
  }
`;

export const progressOverlayStyles = `
  .progress-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .progress-overlay.visible {
    opacity: 1;
  }

  .progress-container {
    background: white;
    border-radius: 8px;
    padding: 24px;
    width: 400px;
    max-width: 90%;
    box-shadow: var(--ui-shadow-lg);
  }

  .progress-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--ui-navy);
    display: flex;
    align-items: center;
  }
  
  /* Styling for firmware name in progress title */
  .progress-title .firmware-name {
    color: var(--ui-red);
    font-weight: 700;
    margin: 0 4px;
  }

  .progress-bar-container {
    height: 8px;
    background: var(--ui-gray-light);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 12px;
  }

  .progress-bar {
    height: 100%;
    background: var(--ui-red);
    width: 0%;
    transition: width 0.3s ease;
  }

  .progress-status {
    font-size: 14px;
    color: var(--ui-gray);
    margin-top: 8px;
  }
`;

export const dialogStyles = `
  .welcome-dialog {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 90%;
    max-width: 750px;
    padding: 2rem;
    position: relative;
    transform: translateY(20px);
    opacity: 1;
    transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
  }

  .jp-kernel-welcome-panel.visible .welcome-dialog {
    transform: translateY(0);
    opacity: 1;
  }

  .firmware-section {
    width: 50%;
    margin-top: 0.75rem;
    animation: fadeIn 0.5s ease-out forwards;
    margin-left: 20px;
  }
  
  .firmware-divider {
    height: 1px;
    width: 100%;
    background-color: var(--ui-gray-light);
    margin: 0.5rem 0;
  }
  
  .device-info {
    margin: 0.5rem 0;
    font-size: 0.95rem;
    color: var(--ui-gray-darker);
  }
  
  .device-detected, .device-not-detected, .device-auto-mode {
    display: flex;
    flex-direction: column;
    padding: 0.8rem;
    border-radius: 6px;
    margin-bottom: 0.5rem;
    transition: all 0.3s ease;
  }
  
  .device-detected {
    background-color: rgba(40, 167, 69, 0.08);
    border-left: 4px solid var(--ui-green);
  }
  
  .device-detected-header, .device-auto-header {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .device-status {
    font-size: 1rem;
  }
  
  .device-details {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    padding-left: 1.8rem;
  }
  
  .firmware-badge {
    display: inline-block;
    background-color: rgba(40, 167, 69, 0.15);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.85rem;
    margin-top: 0.3rem;
    font-weight: 500;
  }
  
  .device-not-detected {
    background-color: rgba(255, 193, 7, 0.08);
    border-left: 4px solid var(--ui-orange);
  }
  
  .device-manual-mode {
    padding-left: 1.8rem;
  }
  
  .device-auto-mode {
    background-color: rgba(13, 110, 253, 0.08);
    border-left: 4px solid var(--ui-blue);
    animation: pulse 2s infinite;
  }
  
  .device-action-hint {
    padding-left: 1.8rem;
    font-size: 0.95rem;
  }
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(0, 122, 255, 0.1);
    }
    70% {
      box-shadow: 0 0 0 6px rgba(0, 122, 255, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(0, 122, 255, 0);
    }
  }
  
  .device-icon {
    margin-right: 0.7rem;
    font-size: 1.2rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .device-icon.success {
    color: var(--ui-green);
  }
  
  .device-icon.warning {
    color: var(--ui-orange);
  }
  
  .device-icon.waiting {
    color: var(--ui-blue);
  }
  
  .device-status.waiting {
    color: var(--ui-blue);
    font-weight: 500;
  }
  
  .firmware-dropdown-container {
    margin: 0.8rem 0;
    width: 100%;
    display: flex;
    align-items: center;
  }
  
  .firmware-dropdown-label {
    display: inline-block;
    margin-right: 0.8rem;
    font-size: 0.95rem;
    font-weight: 500;
    min-width: 6rem;
    color: var(--ui-navy);
  }
  
  .firmware-selector {
    flex: 1;
    padding: 0.6rem 0.8rem;
    border-radius: 6px;
    border: 1px solid var(--ui-gray-light);
    background-color: var(--ui-white);
    color: var(--ui-navy);
    font-size: 0.95rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  
  .firmware-selector:focus {
    outline: none;
    border-color: var(--ui-blue);
    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
  }
  
  .firmware-selector:hover {
    border-color: var(--ui-blue);
  }
  
  /* Add styles for the tooltip */
  .tooltip-container {
    margin-top: 0.8rem;
    font-size: 0.85rem;
    color: var(--ui-gray-darker);
    display: flex;
    align-items: flex-start;
    padding: 0.8rem;
    background-color: rgba(13, 110, 253, 0.05);
    border-radius: 6px;
    border-left: 3px solid var(--ui-blue);
  }
  
  .tooltip-icon {
    margin-right: 0.5rem;
    color: var(--ui-blue);
    font-size: 1rem;
  }
  
  .tooltip-text {
    flex: 1;
    line-height: 1.5;
  }
  
  /* Add extra padding to the flash card */
  [data-action="flash"] .card-content {
    padding-bottom: 0.5rem;
    flex-direction: column;
    align-items: flex-start;
  }
  
  /* Flash card header section that contains icon, title and description */
  [data-action="flash"] .card-header {
    display: flex;
    align-items: center;
    width: 100%;
  }
  
  .welcome-title {
    font-size: 24px;
    margin: 0 0 1.5rem 0;
    color: var(--ui-navy);
    text-align: center;
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    padding: 0.5rem;
    line-height: 1;
    transition: color 0.2s ease-in-out;
  }

  .close-button:hover {
    color: #333;
  }
`;

export const minimizedStyles = `
  .esp-button-container {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 1000;
  }

  .minimized-button {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    padding: 12px;
    overflow: hidden;
  }
  
  .button-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    gap: 8px;
  }

  .minimized-button img {
    width: 60px;
    height: 60px;
    object-fit: contain;
  }
  
  .status-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    margin-top: 4px;
  }

  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #e74c3c;
    display: inline-block;
  }

  .status-indicator.connected {
    background-color: #2ecc71;
  }

  .device-label {
    font-size: 11px;
    color: #555;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: bold;
    line-height: 1.2;
  }

  .minimized-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .minimized-button:active {
    transform: scale(0.95);
  }

  .jp-kernel-welcome-panel.minimized .welcome-overlay {
    opacity: 0;
    visibility: hidden;
  }

  .jp-kernel-welcome-panel.minimizing .welcome-dialog {
    transform: translate(calc(50vw - 32px), calc(50vh - 32px)) scale(0.1);
    opacity: 0;
  }
`;

export const cardStyles = `
  .welcome-card {
    opacity: 0;
    transform: translateY(12px);
    animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    background: var(--ui-white) !important;
    border: 1.5px solid var(--ui-gray-light) !important;
    border-radius: 16px !important;
    padding: 1.25rem !important;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
    margin-bottom: 0.75rem;
    position: relative;
    overflow: hidden;
  }

  .welcome-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(120deg, var(--ui-red), var(--ui-red-dark));
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 0;
  }

  .welcome-card:hover {
    transform: translateY(-2px) scale(1.02);
    border-color: var(--ui-red) !important;
    box-shadow: var(--ui-shadow-md),
                0 0 0 1px var(--ui-red),
                0 0 0 4px rgba(255, 59, 48, 0.12);
  }

  .welcome-card:hover::before {
    opacity: 1;
  }

  .welcome-card:active {
    transform: translateY(0) scale(0.98);
  }

  .card-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
  }

  .welcome-card:hover .welcome-icon,
  .welcome-card:hover .card-title,
  .welcome-card:hover .card-description {
    color: var(--ui-white) !important;
  }

  .welcome-card:nth-child(1) { animation-delay: 0.1s; }
  .welcome-card:nth-child(2) { animation-delay: 0.2s; }
  .welcome-card:nth-child(3) { animation-delay: 0.3s; }

  .welcome-icon {
    font-size: 2rem;
    margin-right: 1.25rem;
    color: var(--ui-red);
    transition: all 0.3s ease;
    text-shadow: var(--ui-shadow-sm);
  }

  .welcome-title {
    color: var(--ui-navy);
    font-size: 1.75rem !important;
    margin: 0 0 1.75rem !important;
    font-weight: 700;
    letter-spacing: -0.5px;
    line-height: 1.2;
  }

  .card-title {
    color: var(--ui-navy);
    font-weight: 600;
    font-size: 1.1rem;
    margin-bottom: 0.375rem;
    transition: color 0.3s ease;
    letter-spacing: -0.3px;
  }

  .card-description {
    color: var(--ui-gray);
    font-size: 0.9375rem;
    transition: color 0.3s ease;
    line-height: 1.4;
  }

  .action-card {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    background: white;
    border: 1px solid #eee;
  }

  .action-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .action-card .icon {
    font-size: 24px;
    margin-right: 1rem;
  }

  .action-card .content {
    flex: 1;
  }

  .action-card .title {
    font-weight: bold;
    margin: 0;
    color: var(--ui-navy);
  }

  .action-card .description {
    margin: 0.25rem 0 0;
    font-size: 0.9rem;
    color: #666;
  }
`;

export const buttonStyles = `
  .close-button {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
    cursor: pointer;
    color: var(--ui-gray);
    background: var(--ui-gray-light);
    border: none;
    font-size: 1.25rem;
    padding: 0;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    opacity: 0.9;
    transform-origin: center;
  }

  .close-button:hover {
    color: var(--ui-white);
    background: var(--ui-red);
    opacity: 1;
    transform: scale(1.1);
    box-shadow: var(--ui-shadow-sm);
  }

  .close-button:active {
    transform: scale(0.95);
  }

  .action-button {
    background: var(--ui-navy);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s;
  }

  .action-button:hover {
    background: #1a2f4c;
  }
`;
