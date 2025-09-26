/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
let yearEndSpendOfferData = null;
let campaignConfigData = null;

class ScYESGeneralScreen {
  constructor() {
    this.gameInstance = null;
    this.isRequireOfferUpdate = false;
    this.isRegistered = false;
    this.campaignExpiryDate = "";
    this.isCampaignExpired = false;
    this.packsCount = 0;
    this.issuedCards = [];
    this.currentCardGroupId = "";
    this.currentCardGroup = [];
    this.issuedCardGroups = [];
    this.issuedRewards = [];
    this.acquiredRewards = [];
    this.isRewardPopupClosed = false;

    // Set DOM elements references
    this.yesCampaignContainer = document.querySelector(
      ".sc-year-end-spend-campaign"
    );
    this.loader = document.querySelector(".sc-year-end-spend-loader");
    this.registrationPage = document.querySelector(
      ".sc-year-end-spend-registration"
    );
    this.regConfirmationPage = document.querySelector(
      ".sc-year-end-spend-reg-confirmation"
    );
    this.landingPage = document.querySelector(".sc-year-end-spend-landing");
    this.checkinPopupModal = document.querySelector(
      ".sc-year-end-spend-checkin-modal"
    );
    this.profilePage = document.querySelector(".sc-year-end-spend-profile");
    this.instructionModalPage = document.querySelector(
      ".sc-year-end-spend-instruction-modal"
    );
    this.instructionPage = document.querySelector(
      ".sc-year-end-spend-instruction"
    );
    this.gamePlayPage = document.querySelector(
      ".sc-year-end-spend-polaroid-game"
    );
    this.cardsCollectionPage = document.querySelector(
      ".sc-year-end-spend-card-collection"
    );
    this.rewardPopupModal = document.querySelector(
      ".sc-year-end-spend-reward-popup"
    );
    this.rewardDetailsModal = document.querySelector(
      ".sc-year-end-spend-reward-details"
    );
    this.endCampaignPage = document.querySelector(
      ".sc-year-end-spend-campaign-end"
    );
    this.errorPage = document.querySelector(".sc-year-end-spend-error");
    this.commonModalPage = document.querySelector(".sc-year-end-spend-modal");
  }

  /**
   * Sets the current game instance.
   *
   * @param {Object} instance - The game instance to set.
   */
  setGameInstance(instance) {
    this.gameInstance = instance;
  }

  /**
   * Method to initialize the Year End Spend campaign and environment configuration
   *
   * Sets session storage items for packs count, issued cards, issued card groups, issued rewards, and acquired rewards.
   * Initiates events and campaign flow
   * Handles errors by logging them and hiding the loader page after a delay.
   *
   */
  init() {
    try {
      const that = this;
      if (
        ["pt.sc.com", "www.sc.com"].includes(window?.location?.hostname) ===
        true
      ) {
        window.general.getDataFromRTIM = true;
        window.general.environment = "prod";
        window.general.libDetails =
          window.location.hostname === "pt.sc.com" ? "stage" : "production";
      }

      window.sessionStorage.setItem("packsCount", that.packsCount);
      window.sessionStorage.setItem(
        "issuedCards",
        JSON.stringify(that.issuedCards)
      );
      window.sessionStorage.setItem(
        "issuedCardGroups",
        JSON.stringify(that.issuedCardGroups)
      );
      window.sessionStorage.setItem(
        "currentCardGroup",
        JSON.stringify(that.currentCardGroup)
      );
      window.sessionStorage.setItem(
        "issuedRewards",
        JSON.stringify(that.issuedRewards)
      );
      window.sessionStorage.setItem(
        "acquiredRewards",
        JSON.stringify(that.acquiredRewards)
      );
      that.initiateEvents();
      that.initiateSpendCampaign();
    } catch (error) {
      console.error("Running function  => init on Error", error);
      setTimeout(() => {
        const loader = document.querySelector(".sc-year-end-spend-loader");
        loader.classList.add("sc-year-end-spend-loader--hide");
      }, 2000);
    }
  }

  /**
   * Initializes all event listeners required for the general flow of the year-end spend campaign.
   * This includes setting up events for registration, confirmation, landing, check-in, profile customization,
   * instruction modals and pages, gameplay, card collection, reward popups and details, end campaign page,
   * common modals, and error pages. Additionally, attaches click event listeners to terms and conditions links.
   *
   * @throws {Error} Throws an error if any event initialization fails.
   */
  initiateEvents() {
    const that = this;
    // eslint-disable-next-line no-useless-catch
    try {
      that.initiateRegistrationPageEvents();
      that.initiateRegConfirmationPageEvents();
      that.initiateLandingPageEvents();
      that.initiateCheckinPageEvents();
      that.initiateProfilePageEvents();
      that.initiateInstructionModalEvents();
      that.initiateInstructionPageEvents();
      that.initiateCardCollectionPageEvents();
      that.initiateRewardPopupEvents();
      that.initiateRewardDetailPopupEvents();
      that.initiateEndCampaignPageEvents();
      that.initiateCommonModalEvents();
      that.initiateErrorPageEvents();

      // Get the terms and conditions links and add click event listeners
      const termsLinks = that.yesCampaignContainer.querySelectorAll(
        ".sc-year-end-spend-campaign__terms-link"
      );
      termsLinks.forEach((termsLink) => {
        termsLink.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          that.handleTermsLink(termsLink);
        });
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Initializes event listeners for the registration page, including:
   * - Scroll event to show/hide the footer when reaching the bottom of the page.
   * - Click event for the registration page close button to exit the campaign page.
   * - Click event for the "how to unlock" link to show instructions modal.
   * - Click event for the register button to handle registration logic.
   *
   * @throws {Error} Throws an error if event initialization fails.
   */
  initiateRegistrationPageEvents() {
    // eslint-disable-next-line no-useless-catch
    const that = this;
    try {
      // Registration page scroll event to show footer
      that.registrationPage.addEventListener("scroll", function () {
        const footer = document.querySelector(
          ".sc-year-end-spend-registration__bottom"
        );

        const scrollPosition =
          that.registrationPage.scrollTop + that.registrationPage.clientHeight;
        const pageHeight = that.registrationPage.scrollHeight;

        if (scrollPosition >= pageHeight - window?.general?.scrollTolerance) {
          if (that.isReachedBottom === false) {
            footer.classList.add(
              "sc-year-end-spend-registration__bottom--visible"
            );
            footer.parentElement.style.paddingBottom = `${footer.offsetHeight}px`;
            that.isReachedBottom = true;
          }
        } else {
          that.isReachedBottom = false;
          footer.classList.remove(
            "sc-year-end-spend-registration__bottom--visible"
          );
        }
      });

      // Get the registration page close button and add a click event listener
      const regPageCloseButton = that.registrationPage.querySelector(
        ".sc-year-end-spend-registration__header-close"
      );
      regPageCloseButton.addEventListener("click", () => {
        that.handleExitCampaignPage();
      });

      // Get the how to unlock link and add a click event listener
      const howToUnlockLink = that.registrationPage.querySelector(
        ".sc-year-end-spend-registration__how-to-unlock-link"
      );
      howToUnlockLink.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        that.showInstructionModal("registration");
        // that.registrationPage.classList.add('sc-year-end-spend-registration--hide');
        // that.showInstructionPage('registration');
      });

      // Get the register button and add a click event listener
      const registerButton = that.registrationPage.querySelector(
        ".sc-year-end-spend-registration__button-register"
      );
      registerButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        that.handleRegistrationClick(registerButton);
      });
    } catch (error) {
      throw new Error(
        `Failed to initiate registration page events: ${error.message}`
      );
    }
  }

  /**
   * Initializes event listeners for the registration confirmation page.
   * Specifically, attaches a click event to the close button that triggers
   * the campaign exit handler.
   *
   * @throws {Error} Throws an error if event initialization fails.
   */
  initiateRegConfirmationPageEvents() {
    const that = this;
    try {
      const confirmationPageCloseButton =
        that.regConfirmationPage.querySelector(
          ".sc-year-end-spend-reg-confirmation__button-close"
        );
      confirmationPageCloseButton.addEventListener("click", () => {
        that.handleExitCampaignPage();
      });
    } catch (error) {
      throw new Error(
        `Failed to initiate registration confirmation page events: ${error.message}`
      );
    }
  }

  /**
   * Initializes event listeners for various interactive elements on the landing page,
   * including buttons for closing the page, unlocking packs, playing the game, viewing prizes,
   * checking in, accessing instructions, and customizing the profile.
   * Handles UI transitions between different pages and modals based on user interactions.
   *
   * @throws {Error} Throws an error if event listener initialization fails.
   */
  initiateLandingPageEvents() {
    const that = this;
    try {
      // Get the landing page close button and add a click event listener
      const landingPageCloseButton = that.landingPage.querySelector(
        ".sc-year-end-spend-landing__header-close"
      );
      landingPageCloseButton.addEventListener("click", () => {
        that.handleExitCampaignPage();
      });

      // Get the unlock pack button and add a click event listener
      const unlockPackButton = that.landingPage.querySelector(
        ".sc-year-end-spend-landing__button-unlock-packs"
      );
      unlockPackButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        that.landingPage.classList.add("sc-year-end-spend-landing--hide");
        that.showInstructionPage("landing");
      });

      // Get the play now button and add a click event listener
      const playButton = that.landingPage.querySelector(
        ".sc-year-end-spend-landing__button-play-now"
      );
      playButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        that.landingPage.classList.add("sc-year-end-spend-landing--hide");
        if (
          that.gameInstance &&
          typeof that.gameInstance.showGameSection === "function"
        ) {
          that.gameInstance.showGameSection();
        }
      });

      // Get the view prizes button and add a click event listener
      const viewPrizesButton = that.landingPage.querySelector(
        ".sc-year-end-spend-landing__button-view-prizes"
      );
      viewPrizesButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        that.landingPage.classList.add("sc-year-end-spend-landing--hide");
        that.showCardCollectionPage();
      });

      // Get the check in button and add a click event listener
      const landingCheckInButton = that.landingPage.querySelector(
        ".sc-year-end-spend-landing__button-check-in"
      );
      landingCheckInButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        that.checkinPopupModal.classList.remove(
          "sc-year-end-spend-checkin-modal--hide"
        );
      });

      // Get the how to play link and add a click event listener
      const howToPlayLink = that.landingPage.querySelector(
        ".sc-year-end-spend-landing__how-to-play-link"
      );
      howToPlayLink.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        that.landingPage.classList.add("sc-year-end-spend-landing--hide");
        that.showInstructionPage("landing");
      });

      // Get the profile customise button and add a click event listener
      const profileCustomiseButton = that.landingPage.querySelector(
        ".sc-year-end-spend-landing__background-image"
      );
      profileCustomiseButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.landingPage.classList.add("sc-year-end-spend-landing--hide");
        this.profilePage.classList.remove("sc-year-end-spend-profile--hide");
      });
    } catch (error) {
      throw new Error(
        `Failed to initiate landing page events: ${error.message}`
      );
    }
  }

  /**
   * Initializes event listeners for the check-in page modal.
   * Specifically, attaches a click event to the modal's close button
   * to hide the modal when clicked.
   *
   * @throws {Error} Throws an error if event listener initialization fails.
   */
  initiateCheckinPageEvents() {
    const that = this;
    try {
      // Get the profile customise back button and add a click event listener
      const checkinModalCloseButton = that.checkinPopupModal.querySelector(
        ".sc-year-end-spend-checkin-modal__button-close"
      );
      checkinModalCloseButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        that.checkinPopupModal.classList.add(
          "sc-year-end-spend-checkin-modal--hide"
        );
      });
    } catch (error) {
      throw new Error(
        `Failed to initiate check-in page events: ${error.message}`
      );
    }
  }

  /**
   * Initializes event listeners for the instruction modal, specifically the close button.
   * When the close button is clicked, the instruction modal is closed.
   * Throws an error if initialization fails.
   *
   * @throws {Error} If the instruction modal events cannot be initiated.
   */
  initiateInstructionModalEvents() {
    const that = this;
    try {
      // Get the instruction modal close button and add a click event listener
      const instructionModalCloseButton =
        that.instructionModalPage.querySelector(
          ".sc-year-end-spend-instruction-modal__button-close"
        );
      instructionModalCloseButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        that.closeInstructionModal();
      });

      // Get the instruction modal tabs and add click event listeners
      const allTabs = that.instructionModalPage.querySelectorAll(
        ".sc-year-end-spend-instruction-modal__tab"
      );
      allTabs.forEach((tab) => {
        tab.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          that.handleTabToggle(
            tab,
            that.instructionModalPage,
            ".sc-year-end-spend-instruction-modal__tab",
            ".sc-year-end-spend-instruction-modal__tab-body"
          );
        });
      });
    } catch (error) {
      throw new Error(
        `Failed to initiate instruction modal events: ${error.message}`
      );
    }
  }

  /**
   * Initializes event listeners for the instruction page's navigation buttons.
   *
   * Adds click event handlers to the instruction page's "back" and "home" buttons.
   * When either button is clicked, the instruction page is hidden and the landing page is shown.
   *
   * @throws {Error} Throws an error if event listener initialization fails.
   */
  initiateInstructionPageEvents() {
    const that = this;
    try {
      // Get the instruction back button and add a click event listener
      const instructionBackButton = that.instructionPage.querySelector(
        ".sc-year-end-spend-instruction__header-back"
      );
      instructionBackButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        that.closeInstructionPage();
        that.landingPage.classList.remove("sc-year-end-spend-landing--hide");
      });

      // Get the instruction back button and add a click event listener
      const instructionBackHomeButton = that.instructionPage.querySelector(
        ".sc-year-end-spend-instruction__bottom-back"
      );
      instructionBackHomeButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        that.closeInstructionPage();
        that.landingPage.classList.remove("sc-year-end-spend-landing--hide");
      });

      // Get the unlock packs link and add a click event listener
      const unlockPacksLink = that.instructionPage.querySelector(
        ".sc-year-end-spend-instruction__unlock-card-link"
      );
      unlockPacksLink.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const unlockPacksTab = that.instructionPage.querySelector(
          '.sc-year-end-spend-instruction__tabs-button[data-tabid="unlock-packs-tab"]'
        );
        that.handleTabToggle(
          unlockPacksTab,
          that.instructionPage,
          ".sc-year-end-spend-instruction__tabs-button",
          ".sc-year-end-spend-instruction__tabs-content"
        );
        that.expandFirstAccordianInActiveTab();
      });

      // Get the tab buttons and add click event listeners
      const instructionPageTabButtons = that.instructionPage.querySelectorAll(
        ".sc-year-end-spend-instruction__tabs-button"
      );
      instructionPageTabButtons.forEach((tabButton) => {
        tabButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          that.handleTabToggle(
            tabButton,
            that.instructionPage,
            ".sc-year-end-spend-instruction__tabs-button",
            ".sc-year-end-spend-instruction__tabs-content"
          );
          that.expandFirstAccordianInActiveTab("instruction");
        });
      });

      // Get the view more buttons and add click event listeners
      const viewMoreButtons = that.instructionPage.querySelectorAll(
        ".sc-year-end-spend-instruction__tabs-tile-view-more"
      );
      viewMoreButtons.forEach((viewMoreButton) => {
        viewMoreButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          that.handleAccordianToggle(
            viewMoreButton,
            "sc-year-end-spend-instruction__tabs-tile",
            true
          );
        });
      });

      // Get the view less buttons and add click event listeners
      const viewLessButtons = that.instructionPage.querySelectorAll(
        ".sc-year-end-spend-instruction__tabs-tile-view-less"
      );
      viewLessButtons.forEach((viewLessButton) => {
        viewLessButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          that.handleAccordianToggle(
            viewLessButton,
            "sc-year-end-spend-instruction__tabs-tile",
            false
          );
        });
      });
    } catch (error) {
      throw new Error(
        `Failed to initiate instruction page events: ${error.message}`
      );
    }
  }

  /**
   * Initializes event listeners for the profile page.
   * Specifically, adds a click event listener to the back button in the profile header.
   * When the back button is clicked, it navigates back to the landing page and hides the profile page.
   *
   * @throws {Error} Throws an error if event listener initialization fails.
   */
  initiateProfilePageEvents() {
    const that = this;
    try {
      // Get the profile customise back button and add a click event listener
      const profilePageBackButton = that.profilePage.querySelector(
        ".sc-year-end-spend-profile__header-back"
      );
      profilePageBackButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        that.landingPage.classList.remove("sc-year-end-spend-landing--hide");
        that.profilePage.classList.add("sc-year-end-spend-profile--hide");
      });
    } catch (error) {
      throw new Error(
        `Failed to initiate profile customisation page events: ${error.message}`
      );
    }
  }

  /**
   * Initializes event listeners for the card collection page UI elements.
   * Handles interactions such as navigating back/closing the collection page,
   * switching tabs, expanding/collapsing card and prize tiles, and displaying prize popups.
   *
   * @throws {Error} Throws an error if event listener initialization fails.
   */
  initiateCardCollectionPageEvents() {
    const that = this;
    try {
      // Get the how to unlock link and add a click event listener
      const collectionPageBackButton = that.cardsCollectionPage.querySelector(
        ".sc-year-end-spend-card-collection__header-back"
      );
      collectionPageBackButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        that.closeCardCollectionPage();
        that.landingPage.classList.remove("sc-year-end-spend-landing--hide");
      });

      // Get the how to unlock link and add a click event listener
      const collectionPageCloseButton = that.cardsCollectionPage.querySelector(
        ".sc-year-end-spend-card-collection__header-close"
      );
      collectionPageCloseButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        that.closeCardCollectionPage();
        that.landingPage.classList.remove("sc-year-end-spend-landing--hide");
      });

      // Get the tab buttons and add click event listeners
      const tabButtons = that.cardsCollectionPage.querySelectorAll(
        ".sc-year-end-spend-card-collection__tabs-button"
      );
      tabButtons.forEach((tabButton) => {
        tabButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          that.handleTabToggle(
            tabButton,
            that.cardsCollectionPage,
            ".sc-year-end-spend-card-collection__tabs-button",
            ".sc-year-end-spend-card-collection__tabs-content"
          );

          that.expandFirstAccordianInActiveTab("card-collection");
        });
      });

      // Get the view more/less card buttons and add click event listeners
      const viewMoreCardButtons = that.cardsCollectionPage.querySelectorAll(
        ".sc-year-end-spend-card-collection__tabs-tile-view-more"
      );
      const viewLessCardButtons = that.cardsCollectionPage.querySelectorAll(
        ".sc-year-end-spend-card-collection__tabs-tile-view-less"
      );
      viewMoreCardButtons.forEach((viewMoreCardButton) => {
        viewMoreCardButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          that.handleAccordianToggle(
            viewMoreCardButton,
            "sc-year-end-spend-card-collection__tabs-tile",
            true
          );
        });
      });
      viewLessCardButtons.forEach((viewLessCardButton) => {
        viewLessCardButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          that.handleAccordianToggle(
            viewLessCardButton,
            "sc-year-end-spend-card-collection__tabs-tile",
            false
          );
        });
      });

      // Get the view more/less prize buttons and add click event listeners
      const viewMorePrizeButtons = that.cardsCollectionPage.querySelectorAll(
        ".sc-year-end-spend-card-collection__tabs-prize-tile-view-more"
      );
      const viewLessPrizeButtons = that.cardsCollectionPage.querySelectorAll(
        ".sc-year-end-spend-card-collection__tabs-prize-tile-view-less"
      );
      viewMorePrizeButtons.forEach((viewMorePrizeButton) => {
        viewMorePrizeButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          that.handleAccordianToggle(
            viewMorePrizeButton,
            "sc-year-end-spend-card-collection__tabs-prize-tile",
            true
          );
        });
      });
      viewLessPrizeButtons.forEach((viewLessPrizeButton) => {
        viewLessPrizeButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          that.handleAccordianToggle(
            viewLessPrizeButton,
            "sc-year-end-spend-card-collection__tabs-prize-tile",
            false
          );
        });
      });

      // Get the view details buttons from card tab and add click event listeners
      const viewCardTabDetailsButtons =
        that.cardsCollectionPage.querySelectorAll(
          ".sc-year-end-spend-card-collection__tabs-reward-prize"
        );
      viewCardTabDetailsButtons.forEach((viewCardTabDetailsButton) => {
        viewCardTabDetailsButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          that.rewardPopupModal.classList.remove(
            "sc-year-end-spend-reward-popup--hide"
          );

          that.timeoutId = setTimeout(() => {
            that.rewardPopupModal.classList.add(
              "sc-year-end-spend-reward-popup--hide"
            );
          }, 5000);
        });
      });

      // Get the view details buttons from prize tab and add click event listeners
      const viewPrizeTabDetailsButtons =
        that.cardsCollectionPage.querySelectorAll(
          ".sc-year-end-spend-card-collection__tabs-prize-tile-info"
        );
      viewPrizeTabDetailsButtons.forEach((viewPrizeTabDetailsButton) => {
        viewPrizeTabDetailsButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          that.rewardPopupModal.classList.remove(
            "sc-year-end-spend-reward-popup--hide"
          );

          that.timeoutId = setTimeout(() => {
            that.rewardPopupModal.classList.add(
              "sc-year-end-spend-reward-popup--hide"
            );
          }, 5000);
        });
      });
    } catch (error) {
      throw new Error(
        `Failed to initiate card collection page events: ${error.message}`
      );
    }
  }

  /**
   * Initializes event listeners for the reward popup modal.
   *
   * - Handles closing the reward popup when the close button is clicked.
   * - Handles viewing reward details by hiding the popup and showing the details modal.
   * - Handles the share link click by logging a message to the console.
   *
   * @throws {Error} Throws an error if initialization of event listeners fails.
   */
  initiateRewardPopupEvents() {
    const that = this;
    try {
      // Get the reward popup close button and add a click event listener
      const rewardPopupCloseButton = that.rewardPopupModal.querySelector(
        ".sc-year-end-spend-reward-popup__close"
      );
      rewardPopupCloseButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        clearTimeout(that.timeoutId);
        that.rewardPopupModal.classList.add(
          "sc-year-end-spend-reward-popup--hide"
        );
      });

      // Get the view reward details button and add a click event listener
      const viewRewardDetailsButton = that.rewardPopupModal.querySelector(
        ".sc-year-end-spend-reward-popup__button-view-details"
      );
      viewRewardDetailsButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        clearTimeout(that.timeoutId);
        that.rewardPopupModal.classList.add(
          "sc-year-end-spend-reward-popup--hide"
        );
        that.rewardDetailsModal.classList.remove(
          "sc-year-end-spend-reward-details--hide"
        );
      });

      // Get the reward details share link and add a click event listener
      const rewardPopupShareLink = that.rewardPopupModal.querySelector(
        ".sc-year-end-spend-reward-popup__share-link"
      );
      rewardPopupShareLink.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        that.handleShareClick("YES-Reward");
      });
    } catch (error) {
      throw new Error(
        `Failed to initiate reward popup events: ${error.message}`
      );
    }
  }

  /**
   * Initializes event listeners for the reward detail popup modal.
   * - Adds a click event to the close button to hide the modal.
   * - Adds a click event to the share link to log a placeholder message.
   *
   * @throws {Error} Throws an error if event listeners cannot be initialized.
   */
  initiateRewardDetailPopupEvents() {
    const that = this;
    try {
      // Get the reward details close button and add click event listeners
      const closeRewardDetailsPopupButton =
        that.rewardDetailsModal.querySelector(
          ".sc-year-end-spend-reward-details__close"
        );
      closeRewardDetailsPopupButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        that.rewardDetailsModal.classList.add(
          "sc-year-end-spend-reward-details--hide"
        );
      });

      // Get the reward details share link and add a click event listener
      const rewardDetailsShareLink = that.rewardDetailsModal.querySelector(
        ".sc-year-end-spend-reward-details__share-link"
      );
      rewardDetailsShareLink.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        that.handleShareClick("YES-RewardDetails");
      });
    } catch (error) {
      throw new Error(
        `Failed to initiate reward detail popup events: ${error.message}`
      );
    }
  }

  /**
   * Initializes event listeners for the common modal, specifically handling the close button click event.
   * When the close button is clicked, the modal's iframe source is cleared and the modal is hidden.
   * Throws an error if initialization fails.
   *
   * @throws {Error} If an error occurs during event listener initialization.
   */
  initiateCommonModalEvents() {
    const that = this;
    try {
      // Get the close modal button and add a click event listener
      const closeModalPage = that.commonModalPage.querySelector(
        ".sc-year-end-spend-modal__header-close"
      );
      closeModalPage.addEventListener("click", () => {
        const modalFrameEle = that.commonModalPage.querySelector(
          ".sc-year-end-spend-modal__content iframe.modal-frame"
        );

        modalFrameEle.src = "";
        that.commonModalPage.classList.add("sc-year-end-spend-modal--hide");
      });
    } catch (error) {
      throw new Error(
        `Failed to initiate common modal events: ${error.message}`
      );
    }
  }

  /**
   * Initializes event listeners for the end campaign page.
   * Specifically, attaches a click event to the back button that triggers
   * the campaign exit handler.
   *
   * @throws {Error} Throws an error if event initialization fails.
   */
  initiateEndCampaignPageEvents() {
    const that = this;
    try {
      const endCampaignPageBackButton = that.endCampaignPage.querySelector(
        ".sc-year-end-spend-campaign-end__button-back"
      );
      endCampaignPageBackButton.addEventListener("click", () => {
        that.handleExitCampaignPage();
      });
    } catch (error) {
      throw new Error(
        `Failed to initiate end campaign page events: ${error.message}`
      );
    }
  }

  /**
   * Initializes event listeners for the error page, specifically the back button.
   * When the back button is clicked, triggers the campaign exit handler.
   * Throws an error if initialization fails.
   *
   * @throws {Error} If event listener initialization fails.
   */
  initiateErrorPageEvents() {
    const that = this;
    try {
      const errorPageBackButton = that.errorPage.querySelector(
        ".sc-year-end-spend-error__button-go-back"
      );
      errorPageBackButton.addEventListener("click", () => {
        that.handleExitCampaignPage();
      });
    } catch (error) {
      throw new Error(`Failed to initiate error page events: ${error.message}`);
    }
  }

  handleShareClick(rewardName) {
    try {
      let shareMessage = window?.general?.shareObject?.message || "";

      if (!shareMessage) return;

      shareMessage = shareMessage.split("{{reward}}").join(rewardName);

      let inputObj = {
        shareTitle: "",
        shareSubject: "",
        shareMessage: shareMessage,
      };

      if (window.cordova) {
        inputObj = {
          title: "",
          subject: "",
          message: shareMessage,
          url: "",
        };

        window.cordova.exec(
          function () {
            return console.log("Social sharing - success callback");
          },
          function (error) {
            return console.error("Social sharing", error);
          },
          "SocialSharing",
          "shareWithOptions",
          [inputObj]
        );
      } else {
        console.error("Running function  => cordova not found");
        const deviceOs = Utils.getDeviceDetails().os;

        if (deviceOs === "Android") {
          window.Android.shareAction(JSON.stringify(inputObj));
        } else if (deviceOs === "iOS") {
          window.webkit.messageHandlers.shareAction.postMessage(inputObj);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Method to add custom data attributes to impression tag elements based on offer and feedback data fron RTIM
   *
   * @param {Object} offerData Offer data object from RTIM
   * @param {string} offerData.id id of the Offer
   * @param {string} offerData.title Offer title
   * @param {Object} offerData.feedback Nested object contains feedback details
   * @param {string} offerData.feedback.name Feedback name
   * @param {string} offerData.feedback.group Feedback group
   * @param {string} offerData.feedback.interactionId id of the interaction
   * @param {string} offerData.feedback.issue Feedback issue detail
   * @param {string} offerData.feedback.placement Feedback placement
   * @param {string} offerData.feedback.rank Feedback rank
   * @param {Element[]} impressionTags Array of DOM elements will capture the user events
   * @throws {Error} Rethrows any error
   *
   */
  addImpressionAttributes(offerData, impressionTags) {
    // eslint-disable-next-line no-useless-catch
    try {
      impressionTags.forEach((impressionTag) => {
        impressionTag.setAttribute("data-productid", offerData?.id);
        impressionTag.setAttribute("data-productdetails", offerData?.title);
        impressionTag.setAttribute(
          "data-feedbackname",
          offerData?.feedback?.name
        );
        impressionTag.setAttribute(
          "data-feedbackgroup",
          offerData?.feedback?.group
        );
        impressionTag.setAttribute(
          "data-feedbackinteractionid",
          offerData?.feedback?.interactionId
        );
        impressionTag.setAttribute(
          "data-feedbackissue",
          offerData?.feedback?.issue
        );
        impressionTag.setAttribute(
          "data-feedbackplacement",
          offerData?.feedback?.placement
        );
        impressionTag.setAttribute(
          "data-feedbackrank",
          offerData?.feedback?.rank
        );
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Method to extracts impression related data from DOM elements and returns it as an object
   *
   * @param {HTMLElement} sourceEle - The DOM element contains 'data-*' attributes related to offer feedback
   * @param {string} outcomeValue - The outcome value related to user interaction('Clicked' or 'Impression')
   * @param {string} contextValue - optional context value needs to be passed in the impression call (eg, voucher code)
   * @returns {Object} impressionObj - object contains extracted impression related data
   * @property {string} impressionObj.name Feedback name
   * @property {string} impressionObj.group Feedback group
   * @property {string} impressionObj.interactionId id of the interaction
   * @property {string} impressionObj.issue Feedback issue detail
   * @property {string} impressionObj.placement Feedback placement
   * @property {string} impressionObj.rank Feedback rank
   * @property {string} impressionObj.outcome The provided outcome value
   * @property {Object} impressionObj.contexts - contexts object related reward
   * @property {string} impressionObj.contexts.type - type of the context value
   * @property {string} impressionObj.contexts.key - key of the context value
   * @property {string} impressionObj.contexts.value - context value related reward
   * @throws {Error} Rethrows any error
   *
   */
  getImpressionObject(sourceEle, outcomeValue, contextValue = null) {
    // eslint-disable-next-line no-useless-catch
    try {
      const impressionObj = {
        name: sourceEle.getAttribute("data-feedbackname"),
        group: sourceEle.getAttribute("data-feedbackgroup"),
        interactionId: sourceEle.getAttribute("data-feedbackinteractionid"),
        issue: sourceEle.getAttribute("data-feedbackissue"),
        placement: sourceEle.getAttribute("data-feedbackplacement"),
        rank: parseInt(sourceEle.getAttribute("data-feedbackrank"), 10),
        outcome: outcomeValue,
      };

      if (contextValue !== null) {
        const contextObj = {};
        contextObj.type = "StatusUpdate";
        contextObj.key = "Reward";
        contextObj.value = contextValue;

        impressionObj.contexts = [contextObj];
      }

      return impressionObj;
    } catch (error) {
      throw new Error(
        `Failed to get impression object error: ${error.message}`
      );
    }
  }

  /**
   * Sends a click impression update via Cordova's exec method using a GraphQL mutation.
   * Handles the response and invokes the provided success callback if the update is successful.
   *
   * @param {Object} impressionObj - The impression data to be sent in the mutation.
   * @param {Function} successCallback - Callback function to execute on successful update.
   */
  updateClickImpression(impressionObj, successCallback) {
    const that = this;

    if (window.cordova) {
      window.cordova.exec(
        function (response) {
          try {
            // Try to parse if response is a string
            if (typeof response === "string") {
              response = JSON.parse(response);
            }

            const status = response?.data?.updateImpression?.status;

            if (typeof status === "string" && status.toLowerCase() === "ok") {
              successCallback(response);
            } else if (status === "200" || status === 200) {
              successCallback(response);
            } else {
              console.error("Error on Click Impression", response);
            }
          } catch (error) {
            console.error(
              "Failed to parse or handle response:",
              error,
              response
            );
          }
        },
        function (error) {
          //Failed to retrieve data will trigger this callback
          console.error("Error on Click Impression: " + error);
        },
        "gqlplugin", //plugin name
        "request", //function name
        [
          JSON.stringify({
            operationName: "updateImpression",
            variables: {
              input: impressionObj,
            },
            query:
              "mutation updateImpression($input: CustomerOfferFeedbackInput!) { updateImpression(feedback: $input) { __typename status message } }",
          }),
          JSON.stringify({ "X-APOLLO-OPERATION-NAME": "updateImpression" }),
          "POST",
        ] //body(JSONString),header(JSONString),requestMethod
      );
    }
  }

  /**
   * Method to invoke a click impression update on user interaction events
   *
   * this function constructs the impression object using the source element, outcome value, reward value if any
   * invoke the updateClickImpression method to trigger the request
   *
   * @param {HTMLElement} sourceEle - The DOM element contains 'data-*' attributes related to offer feedback
   * @param {string} rewardValue - The reward value from the offer data
   *
   */
  handleClickImpressionOnEvent(sourceEle, onEvent, rewardValue) {
    const that = this;
    const successCallback = (response) => {
      switch (onEvent) {
        case "registration":
          setTimeout(() => {
            that.handleRegConfirmationPage();
          }, 1000);
          break;
        case "game-play":
          that.handleGamePlayImpressionSuccess(rewardValue);
          break;
        default:
          console.error(
            "Success on Click Impression: " + JSON.stringify(response)
          ); // Successfully obtaining data will trigger this callback
      }
    };

    let impressionObj = that.getImpressionObject(sourceEle, "Clicked");

    if (onEvent === "game-play") {
      const issuedCardGroups =
        JSON.parse(window.sessionStorage.getItem("issuedCardGroups")) || [];
      const currentCardGroup = issuedCardGroups.shift();
      that.currentCardGroupId = Object.keys(currentCardGroup)[0];
      let contextValue =
        rewardValue.toLowerCase() === "all"
          ? "AllCards"
          : that.currentCardGroupId;

      impressionObj.contexts = [
        {
          type: "StatusUpdate",
          value: contextValue,
          key: "RewardGroupID",
        },
      ];
    }

    that.updateClickImpression(impressionObj, successCallback);

    if (window.general.environment === "dev") {
      that.handleGamePlayImpressionSuccess(rewardValue);
    }
  }

  /**
   * Method to send a view impression update on page load
   *
   * this function constructs the impression object using the source page and outcome value
   * then triggers the request through if cordova is available
   *
   * @param {HTMLElement} sourceEle - The DOM element contains 'data-*' attributes related to offer feedback
   *
   */
  updateViewImpression(sourceEle) {
    // http request for updateImpression, 'input' will be dynamic, can get in offers item 'feedback'
    let impressionObj = this.getImpressionObject(sourceEle, "Impression");

    if (window.cordova) {
      window.cordova.exec(
        function (response) {
          //Successfully obtaining data will trigger this callback
          console.log("Success: " + JSON.stringify(response)); // the success value will be a json string
        },
        function (error) {
          //Failed to retrieve data will trigger this callback
          console.error("Error: " + error);
        },
        "gqlplugin", //plugin name
        "request", //function name
        [
          JSON.stringify({
            operationName: "updateImpression",
            variables: {
              input: impressionObj,
            },
            query:
              "mutation updateImpression($input: CustomerOfferFeedbackInput!) { updateImpression(feedback: $input) { __typename status message } }",
          }),
          JSON.stringify({ "X-APOLLO-OPERATION-NAME": "updateImpression" }),
          "POST",
        ] //body(JSONString),header(JSONString),requestMethod
      );
    }
  }

  /**
   * Groups an array of card objects by a specified property.
   *
   * @param {Object[]} cards - The array of card objects to group.
   * @param {string} propertyName - The property name to group cards by.
   * @returns {Object[]} An array of objects, each containing a group of cards keyed by the property value.
   */
  groupCardsByProperty(cards, propertyName) {
    const cardGroups = cards.reduce((acc, card) => {
      const groupId = card[propertyName];
      if (!acc[groupId]) {
        acc[groupId] = [];
      }
      acc[groupId].push(card);
      return acc;
    }, {});

    return Object.keys(cardGroups).map((groupId) => ({
      [groupId]: cardGroups[groupId],
    }));
  }

  /**
   * Sets offer-related values from the provided offer data object.
   * Extracts registration status, campaign expiry date, packs count, issued cards, and issued rewards
   * from the `fields` array in the offer data, and assigns them to instance properties.
   * Also stores packs count, issued cards, and issued rewards in sessionStorage.
   *
   * @param {Object} offerData - The offer data object containing fields to extract.
   * @param {Array<Object>} offerData.fields - Array of field objects with `name` and `value` properties.
   * @throws {Error} Throws if an error occurs during processing.
   */
  setOfferValues(offerData) {
    const that = this;
    // eslint-disable-next-line no-useless-catch
    try {
      if (typeof offerData === "object" && offerData !== null) {
        let issuedCardGroups = [];
        const {
          isRegistered,
          campaignExpiryDate,
          packsCount,
          issuedCards,
          issuedRewards,
          acquiredRewards,
        } = offerData.fields.reduce(
          (acc, field) => {
            if (
              field.name ===
                (campaignConfigData?.offer?.fields?.registered ||
                  "Registered") &&
              field.value.toLowerCase() === "y"
            ) {
              acc.isRegistered = true;
            }
            if (
              field.name ===
                (campaignConfigData?.offer?.fields?.campaignExpiryDate ||
                  "CampaignExpiryDate") &&
              field.value
            ) {
              acc.campaignExpiryDate = field.value;
            }
            if (
              field.name ===
                (campaignConfigData?.offer?.fields?.packsCount || "Chances") &&
              field.value
            ) {
              acc.packsCount = parseInt(field.value);
            }
            if (
              field.name ===
                (campaignConfigData?.offer?.fields?.allCards || "AllCards") &&
              field.value
            ) {
              acc.issuedCards = JSON.parse(field.value);
              issuedCardGroups = that.groupCardsByProperty(
                acc.issuedCards,
                campaignConfigData?.offer?.groupId || "groupId"
              );
            }
            if (
              field.name ===
                (campaignConfigData?.offer?.fields?.allRewards ||
                  "AllRewards") &&
              field.value &&
              offerData.id ===
                (campaignConfigData?.offer?.landing || "EGCCYESLanding")
            ) {
              acc.issuedRewards = JSON.parse(field.value);
            }
            if (
              field.name ===
                (campaignConfigData?.offer?.fields?.allCards || "AllCards") &&
              field.value &&
              offerData.id ===
                (campaignConfigData?.offer?.summary || "EGCCYESSummary")
            ) {
              acc.acquiredRewards = JSON.parse(field.value);
            }
            return acc;
          },
          {
            isRegistered: false,
            campaignExpiryDate: "",
            packsCount: 0,
            issuedCards: [],
            issuedRewards: [],
            acquiredRewards: [],
          }
        );

        that.isRegistered = isRegistered;
        that.campaignExpiryDate = campaignExpiryDate;
        that.packsCount = packsCount;
        that.issuedCards = issuedCards;
        that.issuedCardGroups = issuedCardGroups;
        that.issuedRewards = issuedRewards;
        that.acquiredRewards = acquiredRewards;

        // Store values in sessionStorage
        window.sessionStorage.setItem("isRegistered", isRegistered);
        window.sessionStorage.setItem("campaignExpiryDate", campaignExpiryDate);
        window.sessionStorage.setItem("packsCount", packsCount);
        window.sessionStorage.setItem(
          "issuedCards",
          JSON.stringify(issuedCards)
        );
        window.sessionStorage.setItem(
          "issuedCardGroups",
          JSON.stringify(issuedCardGroups)
        );
        window.sessionStorage.setItem(
          "issuedRewards",
          JSON.stringify(issuedRewards)
        );
        window.sessionStorage.setItem(
          "acquiredRewards",
          JSON.stringify(acquiredRewards)
        );
      }
    } catch (error) {
      throw error;
    }
  }

  setGamePageAttributes(offerData) {
    const that = this;
    try {
      if (parseInt(window.localStorage.getItem("turnsCount")) > 0) {
        const gameContainer = that.gamePlayPage.querySelector(
          ".sc-year-end-spend-polaroid-game__wrapper"
        );

        that.addImpressionAttributes(offerData, [gameContainer]);
      }
    } catch (error) {
      this.handleErrorPage(
        `Failed to set game page attributes: ${error.message}`,
        "loader"
      );
      console.error("setGamePageAttributes error:", error);
    }
  }

  /**
   * Handles the display of the terms and conditions link in a modal.
   * Retrieves the URL from the provided element's 'data-link' attribute or a global fallback,
   * sets it as the source of the modal's iframe, and shows the modal.
   *
   * @param {HTMLElement} linkEle - The element containing the terms link information.
   */
  handleTermsLink(linkEle) {
    const that = this;
    try {
      const href =
        linkEle.getAttribute("data-link") || campaignConfigData?.termsLink;

      if (href) {
        const modalFrameEle = that.commonModalPage.querySelector(
          ".sc-year-end-spend-modal__content iframe.modal-frame"
        );

        modalFrameEle.src = href;
        that.commonModalPage.classList.remove("sc-year-end-spend-modal--hide");
      }
    } catch (error) {
      console.error("handleTermsLink error: ", error);
    }
  }

  /**
   * Handles the exit action from the campaign page.
   * Creates a temporary anchor element and programmatically triggers a click event
   * to exit the campaign page.
   */
  handleExitCampaignPage() {
    const link = document.createElement("a");
    link.href = "https://www.sc.com/exit";
    link.click();
  }

  /**
   * Handles the display of the error page by hiding the loader and showing the error page.
   * Logs the provided error message to the console.
   *
   * @param {string} errorMsg - The error message to display and log.
   * @param {string} [sourcePageName='loader'] - The name of the source page where the error occurred.
   */
  handleErrorPage(errorMsg, sourcePageName = "loader") {
    try {
      const that = this;

      that.loader.classList.add("sc-year-end-spend-loader--hide");
      that.errorPage.classList.remove("sc-year-end-spend-error--hide");
      console.error(`error message on ${sourcePageName}: `, errorMsg);
    } catch (error) {
      console.error("handleErrorPage error: ", error);
    }
  }

  handleGamePlayImpressionSuccess(rewardValue) {
    const that = this;
    try {
      let packsCount = parseInt(window.sessionStorage.getItem("packsCount"));
      let issuedCardGroups = JSON.parse(
        window.sessionStorage.getItem("issuedCardGroups")
      );
      let currentCardGroup = JSON.parse(
        window.sessionStorage.getItem("currentCardGroup")
      );

      if (rewardValue === "all") {
        packsCount = 0;
        currentCardGroup = [...issuedCardGroups];
        issuedCardGroups = [];
      } else {
        packsCount = packsCount - 1;
        let earnedCardGroup = issuedCardGroups.filter(
          (cardGroup) => cardGroup[that.currentCardGroupId]
        );
        issuedCardGroups = issuedCardGroups.filter(
          (cardGroup) => !cardGroup[that.currentCardGroupId]
        );
        currentCardGroup = [...earnedCardGroup];
      }

      window.sessionStorage.setItem("packsCount", packsCount);
      window.sessionStorage.setItem(
        "issuedCardGroups",
        JSON.stringify(issuedCardGroups)
      );
      window.sessionStorage.setItem(
        "currentCardGroup",
        JSON.stringify(currentCardGroup)
      );

      console.log("handleGamePlayImpressionSuccess is over");
      // that.gameInstance.invokePrizePopup();
    } catch (error) {
      that.handleErrorPage(
        `Failed to handle game play impression success: ${error.message}`,
        "loader"
      );
      console.error("handleGamePlayImpressionSuccess error:", error);
    }
  }

  /**
   * Closes the card collection page by adding a CSS class to hide it.
   * Handles any errors that occur during the process and logs them.
   *
   * @returns {void}
   */
  closeCardCollectionPage() {
    try {
      this.cardsCollectionPage.classList.add(
        "sc-year-end-spend-card-collection--hide"
      );
    } catch (error) {
      this.handleErrorPage(
        `Failed to close card collection page: ${error.message}`,
        "loader"
      );
      console.error("closeCardCollectionPage error:", error);
    }
  }

  /**
   * Displays the card collection page, initializes the active tab, and sets up event handlers
   * for tab toggling and accordion functionality. Handles errors by displaying an error page.
   *
   * @param {string} [sourcePage=''] - The source page identifier to track where the navigation originated from.
   */
  showCardCollectionPage(sourcePage = "") {
    const that = this;
    try {
      that.sourcePage = sourcePage;
      let initialActiveTab = that.cardsCollectionPage.querySelector(
        '.sc-year-end-spend-card-collection__tabs-button[data-tabid="my-cards"]'
      );

      that.handleTabToggle(
        initialActiveTab,
        that.cardsCollectionPage,
        ".sc-year-end-spend-card-collection__tabs-button",
        ".sc-year-end-spend-card-collection__tabs-content"
      );
      that.expandFirstAccordianInActiveTab("card-collection");
      that.cardsCollectionPage.classList.remove(
        "sc-year-end-spend-card-collection--hide"
      );
    } catch (error) {
      that.handleErrorPage(
        `Failed to show card collection page: ${error.message}`,
        "loader"
      );
      console.error("showCardCollectionPage error:", error);
    }
  }

  /**
   * Closes the instruction modal by adding a CSS class to hide it.
   * Handles any errors that occur during the process and logs them.
   *
   * @returns {void}
   */
  closeInstructionModal() {
    try {
      this.instructionModalPage.classList.add(
        "sc-year-end-spend-instruction-modal--hide"
      );
    } catch (error) {
      this.handleErrorPage(
        `Failed to close instruction modal: ${error.message}`,
        "loader"
      );
      console.error("closeInstructionModal error:", error);
    }
  }

  /**
   * Displays the instruction modal for the specified source page.
   * Initializes the modal by activating the default tab and making the modal visible.
   * Handles errors by displaying an error page and logging the error to the console.
   *
   * @param {string} sourcePage - The identifier of the page from which the instruction modal is triggered.
   */
  showInstructionModal(sourcePage) {
    const that = this;
    try {
      that.sourcePage = sourcePage;
      const initialActiveTab = that.instructionModalPage.querySelector(
        '.sc-year-end-spend-instruction-modal__tab[data-tabid="instruction-modal-tab-spend"]'
      );
      that.handleTabToggle(
        initialActiveTab,
        that.instructionModalPage,
        ".sc-year-end-spend-instruction-modal__tab",
        ".sc-year-end-spend-instruction-modal__tab-body"
      );

      that.instructionModalPage.classList.remove(
        "sc-year-end-spend-instruction-modal--hide"
      );
    } catch (error) {
      that.handleErrorPage(
        `Failed to show instruction modal: ${error.message}`,
        "loader"
      );
      console.error("showInstructionModal error:", error);
    }
  }

  /**
   * Closes the instruction page by adding a CSS class to hide it.
   * Handles any errors that occur during the process and logs them.
   *
   * @returns {void}
   */
  closeInstructionPage() {
    try {
      this.instructionPage.classList.add("sc-year-end-spend-instruction--hide");
    } catch (error) {
      this.handleErrorPage(
        `Failed to close instruction page: ${error.message}`,
        "loader"
      );
      console.error("closeInstructionPage error:", error);
    }
  }

  /**
   * Displays the instruction page modal and initializes its state based on the source page.
   *
   * - Sets the active tab depending on the source page (defaults to "instruction-tab" or "unlock-packs-tab" for "game-screen").
   * - Handles tab toggling and initializes the first tile's "view more" accordion in the active tab.
   * - Makes the instruction page visible by removing the hide class.
   * - Handles and logs errors if any step fails.
   *
   * @param {string} [sourcePage=''] - The source page from which the instruction modal is invoked (e.g., 'game-screen').
   */
  showInstructionPage(sourcePage = "landing") {
    const that = this;
    try {
      that.sourcePage = sourcePage;
      let initialActiveTab = that.instructionPage.querySelector(
        '.sc-year-end-spend-instruction__tabs-button[data-tabid="instruction-tab"]'
      );

      const packsCountEle = that.instructionPage.querySelector(
        ".sc-year-end-spend-instruction__bottom-packs"
      );
      packsCountEle.textContent = parseInt(
        window.sessionStorage.getItem("packsCount"),
        10
      );

      if (sourcePage === "registration") {
        initialActiveTab = that.instructionPage.querySelector(
          '.sc-year-end-spend-instruction__tabs-button[data-tabid="unlock-packs-tab"]'
        );
      }

      that.handleTabToggle(
        initialActiveTab,
        that.instructionPage,
        ".sc-year-end-spend-instruction__tabs-button",
        ".sc-year-end-spend-instruction__tabs-content"
      );

      that.expandFirstAccordianInActiveTab("instruction");
      that.instructionPage.classList.remove(
        "sc-year-end-spend-instruction--hide"
      );
    } catch (error) {
      that.handleErrorPage(
        `Failed to show instruction page: ${error.message}`,
        "loader"
      );
      console.error("showInstructionPage error:", error);
    }
  }

  /**
   * Displays the landing page by updating the packs count element and removing the hide class.
   * Retrieves the packs count from sessionStorage and sets it in the landing page.
   * Handles errors by showing an error page and logging the error to the console.
   *
   * @throws {Error} If there is an issue displaying the landing page.
   */
  showLandingPage() {
    const that = this;
    try {
      const packsCountEle = that.landingPage.querySelector(
        ".sc-year-end-spend-landing__packs-count"
      );
      if (packsCountEle)
        packsCountEle.textContent = parseInt(
          window.sessionStorage.getItem("packsCount"),
          10
        );

      this.landingPage.classList.remove("sc-year-end-spend-landing--hide");
    } catch (error) {
      this.handleErrorPage(
        `Failed to show landing page: ${error.message}`,
        "loader"
      );
      console.error("showLandingPage error:", error);
    }
  }

  /**
   * Expands the first accordion in the currently active tab of the specified source page.
   *
   * Depending on the `sourcePageName`, it selects the appropriate tab content and tile element class.
   * If the active tab is "my-prizes" within the "card-collection" page, it uses a different tile class.
   * Then, it finds the "view more" button within the first tile and triggers the accordion toggle handler.
   *
   * @param {string} [sourcePageName='instruction'] - The name of the source page to operate on.
   *        Valid values are 'instruction' or 'card-collection'.
   * @throws {Error} Throws an error if the expansion process fails.
   */
  expandFirstAccordianInActiveTab(sourcePageName = "instruction") {
    const that = this;
    try {
      let tileElementClass = "sc-year-end-spend-instruction__tabs-tile";
      let activeTabContent = that.instructionPage.querySelector(
        ".sc-year-end-spend-instruction__tabs-content.active"
      );

      if (sourcePageName === "card-collection") {
        activeTabContent = that.cardsCollectionPage.querySelector(
          ".sc-year-end-spend-card-collection__tabs-content.active"
        );
        tileElementClass = "sc-year-end-spend-card-collection__tabs-tile";

        if (activeTabContent.id === "my-prizes") {
          tileElementClass =
            "sc-year-end-spend-card-collection__tabs-prize-tile";
        }
      }

      const tileElement = activeTabContent.querySelector(
        `.${tileElementClass}`
      );
      const viewMoreButton = tileElement.querySelector(
        `.${tileElementClass}-view-more`
      );

      that.handleAccordianToggle(viewMoreButton, tileElementClass, true);
    } catch (error) {
      throw new Error(
        `Failed to expand first accordion in active tab: ${error.message}`
      );
    }
  }

  /**
   * Toggles the active state of tabs and their corresponding content panels.
   *
   * @param {HTMLElement} eventTarget - The tab element that was clicked or triggered.
   * @param {HTMLElement} parentPage - The parent container element that holds the tabs and tab contents.
   * @param {string} tabClass - The CSS selector for the tab elements within the parent container.
   * @param {string} tabContentClass - The CSS selector for the tab content elements within the parent container.
   * @throws {Error} Throws an error if tab toggling fails.
   */
  handleTabToggle(eventTarget, parentPage, tabClass, tabContentClass) {
    try {
      const allTabs = parentPage.querySelectorAll(tabClass);
      const allTabContents = parentPage.querySelectorAll(tabContentClass);

      allTabs.forEach((tab, index) => {
        const isActive = tab === eventTarget;
        tab.classList.toggle("active", isActive);
        allTabContents[index].classList.toggle(
          "active",
          isActive &&
            eventTarget.getAttribute("data-tabid") === allTabContents[index].id
        );
      });
    } catch (error) {
      throw new Error(`Failed to toggle tabs: ${error.message}`);
    }
  }

  /**
   * Toggles the 'expanded' class on the closest parent container with the specified class.
   *
   * @param {HTMLElement} eventTarget - The DOM element that triggered the event.
   * @param {string} parentContainerClass - The class name of the parent container to search for.
   * @param {boolean} [expand=true] - Whether to add ('true') or remove ('false') the 'expanded' class.
   * @throws {Error} Throws an error if the toggle operation fails.
   */
  handleAccordianToggle(eventTarget, parentContainerClass, expand = true) {
    try {
      const parentContainer = eventTarget.closest(`.${parentContainerClass}`);
      parentContainer.classList.toggle("expanded", expand);
    } catch (error) {
      throw new Error(`Failed to toggle accordion: ${error.message}`);
    }
  }

  /**
   * Handles the rendering and initialization of the landing page for the year-end spend campaign.
   * Sets offer values, updates expiry date, adds impression attributes, and manages loader visibility.
   * If the expected offer is not available, displays an error page.
   *
   * @param {Object} that - The context object containing references to DOM elements and utility methods.
   * @param {HTMLElement} that.landingPage - The landing page DOM element.
   * @param {HTMLElement} that.loader - The loader DOM element.
   * @param {string} that.campaignExpiryDate - The expiry date string for the campaign.
   * @param {Function} that.setOfferValues - Method to set offer values on the page.
   * @param {Function} that.addImpressionAttributes - Method to add impression attributes to elements.
   * @param {Function} that.updateViewImpression - Method to update view impression for analytics.
   * @param {Function} that.handleErrorPage - Method to render the error page.
   */
  handleLandingPage(that) {
    try {
      const landingOfferId =
        campaignConfigData?.offer?.landing || "EGCCYESLanding";
      const expectedOffer = Array.isArray(yearEndSpendOfferData?.offers)
        ? yearEndSpendOfferData.offers.filter(
            (offer) => offer?.id === landingOfferId
          )[0]
        : null;

      if (typeof expectedOffer === "object" && expectedOffer !== null) {
        if (that.isRequireOfferUpdate === true)
          that.setOfferValues(expectedOffer);

        const packsCount = parseInt(
          window.sessionStorage.getItem("packsCount"),
          10
        );
        const issuedCardGroups = JSON.parse(
          window.sessionStorage.getItem("issuedCardGroups") || "[]"
        );

        if (packsCount < 0) {
          throw new Error("Packs count should not be negative");
        }

        if (packsCount !== issuedCardGroups.length) {
          throw new Error(
            "Packs count should match with issued card group length"
          );
        }

        const expiryDateEle = that.landingPage.querySelector(
          ".sc-year-end-spend-landing__expiry-date"
        );
        if (expiryDateEle) expiryDateEle.textContent = that.campaignExpiryDate;

        const packsCountEle = that.landingPage.querySelector(
          ".sc-year-end-spend-landing__packs-count"
        );
        if (packsCountEle) packsCountEle.textContent = that.packsCount;

        if (that.packsCount === 0) {
          that.landingPage.classList.add("zero-packs");
        } else {
          that.landingPage.classList.remove("zero-packs");
        }

        that.addImpressionAttributes(expectedOffer, [that.landingPage]);
        that.setGamePageAttributes(expectedOffer);
        that.updateViewImpression(that.landingPage);
        that.loader.classList.add("sc-year-end-spend-loader--hide");
        that.landingPage.classList.remove("sc-year-end-spend-landing--hide");
      } else {
        throw new Error("Year end spend landing offer is not available");
      }
    } catch (error) {
      that.handleErrorPage(
        `Failed to render landing page: ${error.message}`,
        "loader"
      );
      console.error("handleLandingPage error:", error);
    }
  }

  /**
   * Handles the rendering and interaction logic for the registration confirmation page.
   * Sets up the "Get Started" button click event to transition to the next page,
   * display a loader, and fetch RTIM offer data before proceeding.
   * Also manages the visibility of loader and confirmation page elements.
   * Catches and handles any errors that occur during the process.
   *
   * @function
   * @throws {Error} If rendering the registration confirmation page fails.
   */
  handleRegConfirmationPage() {
    const that = this;
    try {
      const getStartedButton = that.regConfirmationPage.querySelector(
        ".sc-year-end-spend-reg-confirmation__button-get-started"
      );

      getStartedButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        that.loader.classList.remove("sc-year-end-spend-loader--hide");
        that.registrationPage.classList.add(
          "sc-year-end-spend-registration--hide"
        );
        that.regConfirmationPage.classList.add(
          "sc-year-end-spend-reg-confirmation--hide"
        );

        setTimeout(() => {
          that.isRequireOfferUpdate = true;
          that.fetchRTIMOfferData(that.handleLandingPage);
        }, 2000);
      });
      that.loader.classList.add("sc-year-end-spend-loader--hide");
      that.regConfirmationPage.classList.remove(
        "sc-year-end-spend-reg-confirmation--hide"
      );
    } catch (error) {
      that.handleErrorPage(
        `Failed to render registration confirmation page: ${error.message}`,
        "loader"
      );
      console.error("handleRegConfirmationPage error:", error);
    }
  }

  /**
   * Handles the registration button click event.
   * Shows the loader, tracks the click impression, and simulates registration in the dev environment.
   * On error, displays an error page and logs the error.
   *
   * @param {HTMLElement} registerButton - The registration button element that was clicked.
   */
  handleRegistrationClick(registerButton) {
    const that = this;
    try {
      that.loader.classList.remove("sc-year-end-spend-loader--hide");
      that.handleClickImpressionOnEvent(registerButton, "registration");

      if (window?.general?.environment === "dev") {
        setTimeout(() => {
          that.handleRegConfirmationPage();
        }, 1000);
      }
    } catch (error) {
      that.handleErrorPage(
        `Failed to handle registration click: ${error.message}`,
        "loader"
      );
      console.error("handleRegistrationClick error:", error);
    }
  }

  /**
   * Handles the rendering and setup of the registration page for the year-end spend campaign.
   * Updates expiry date, adds impression attributes, updates analytics, and manages loader visibility.
   * If an error occurs during rendering, displays an error page and logs the error.
   *
   * @param {Object} expectedOffer - The offer object expected to be displayed on the registration page.
   */
  handleRegistrationPage(expectedOffer) {
    const that = this;
    try {
      const expiryDateEle = that.registrationPage.querySelector(
        ".sc-year-end-spend-registration__expiry-date"
      );
      const registerButton = that.registrationPage.querySelector(
        ".sc-year-end-spend-registration__button-register"
      );

      if (expiryDateEle) expiryDateEle.textContent = that.campaignExpiryDate;

      that.addImpressionAttributes(expectedOffer, [
        that.registrationPage,
        registerButton,
      ]);
      that.updateViewImpression(that.registrationPage);
      that.loader.classList.add("sc-year-end-spend-loader--hide");
      that.registrationPage.classList.remove(
        "sc-year-end-spend-registration--hide"
      );
    } catch (error) {
      that.handleErrorPage(
        `Failed to render registration page: ${error.message}`,
        "loader"
      );
      console.error("handleRegistrationPage error:", error);
    }
  }

  /**
   * Handles the display of the end campaign page by hiding the loader and showing the campaign end section.
   * If an error occurs during this process, it renders the error page and logs the error to the console.
   *
   * @throws {Error} If there is a failure in rendering the end campaign page.
   */
  handleEndCampaignPage() {
    const that = this;
    try {
      that.loader.classList.add("sc-year-end-spend-loader--hide");
      that.endCampaignPage.classList.remove(
        "sc-year-end-spend-campaign-end--hide"
      );
    } catch (error) {
      that.handleErrorPage(
        `Failed to render end campaign page: ${error.message}`,
        "loader"
      );
      console.error("handleEndCampaignPage error:", error);
    }
  }

  /**
   * Handles the expiry logic for a campaign based on the user's registration status.
   *
   * - If the user is registered, the expiry date is extended by a configurable delay (`window.general.expiryDayDelay`).
   * - If the user is not registered, the campaign expires on the original expiry date.
   * - Sets `isCampaignExpired` to `true` if the campaign is expired.
   *
   * @throws {Error} Throws any error encountered during date calculations.
   */
  handleCampaignExpiry() {
    const that = this;
    // eslint-disable-next-line no-useless-catch
    try {
      const inputExpiryDate = new Date(that.campaignExpiryDate),
        currentDate = new Date(new Date().setHours(0, 0, 0, 0));

      if (that.isRegistered === true) {
        let futureExpiryDate = new Date(that.campaignExpiryDate);

        futureExpiryDate.setDate(
          inputExpiryDate.getDate() + campaignConfigData?.expiryDayDelay || 0
        );

        if (futureExpiryDate < currentDate) that.isCampaignExpired = true;
      } else {
        if (inputExpiryDate < currentDate) that.isCampaignExpired = true;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Initializes the Year End Spend page by selecting the appropriate offer and handling the campaign flow.
   * Determines if the user is registered, if the campaign is expired, and navigates to the corresponding page.
   * Handles errors by displaying an error page and logging the error.
   *
   * @param {Object} that - The context object containing methods and properties for page handling.
   * @param {Function} that.setOfferValues - Sets the values for the selected offer.
   * @param {Function} that.handleCampaignExpiry - Checks and sets the campaign expiry status.
   * @param {boolean} that.isCampaignExpired - Indicates if the campaign has expired.
   * @param {Function} that.handleEndCampaignPage - Handles the page shown when the campaign has ended.
   * @param {boolean} that.isRegistered - Indicates if the user is registered.
   * @param {Function} that.handleLandingPage - Handles the landing page for registered users.
   * @param {Function} that.handleRegistrationPage - Handles the registration page for new users.
   * @param {Function} that.handleErrorPage - Handles displaying an error page.
   * @throws {Error} Throws an error if the expected offer is not available.
   */
  handleYearEndSpendPage(that) {
    try {
      const expectedOffer = Array.isArray(yearEndSpendOfferData?.offers)
        ? yearEndSpendOfferData.offers.filter((offer) =>
            [
              campaignConfigData?.offer?.registration || "EGCCYESRegistration",
              campaignConfigData?.offer?.landing || "EGCCYESLanding",
            ].includes(offer?.id)
          )[0]
        : null;

      if (typeof expectedOffer === "object" && expectedOffer !== null) {
        that.setOfferValues(expectedOffer);
        that.handleCampaignExpiry();

        if (that.isCampaignExpired === true) {
          that.handleEndCampaignPage();
        } else {
          if (that.isRegistered === true) {
            that.handleLandingPage(that);
          } else {
            that.handleRegistrationPage(expectedOffer);
          }
        }
      } else {
        throw new Error("Year end spend offer is not available");
      }
    } catch (error) {
      that.handleErrorPage(
        `Failed to initialize year end spend page: ${error.message}`,
        "loader"
      );
      console.error("handleYearEndSpendPage error:", error);
    }
  }

  /**
   * Method to fetch the customer offer data from RTIM via Cordova JS Bridge
   *
   * This function contructs the GraphQL request payload and attempts tocall a native service
   * through the Cordova plugin system to fetch data
   * If Cordova is unavailable or request fails, the promise is rejected with appropriate error
   *
   * @returns {Promise<Object>} A promise that resolves with the data from the native Cordova plugin,
   * or rejects with an error if the request fails or Cordova is not available
   *
   */
  getDataFromJsBridge() {
    // eslint-disable-next-line no-undef
    return new Promise((resolve, reject) => {
      if (window.cordova) {
        let body = JSON.stringify({
          operationName: "getCustomerOffers",
          variables: {
            placeholder:
              campaignConfigData?.placeholder || "gamification_offers",
            icmId: window.sessionStorage.getItem("icmpid"),
            templateMerge: false,
          },
          query:
            "query getCustomerOffers($placeholder: String!, $icmId: String, $templateMerge: Boolean) { offers(placeholder: $placeholder, icmId: $icmId, templateMerge: $templateMerge) { __typename placeholder offers { __typename id title message images { __typename ...imageSet } primarycta { __typename ...ctaLink } secondarycta { __typename ...ctaLink } feedback { __typename name group interactionId issue rank placement } index fields { __typename name value } } } } fragment imageSet on ImageSet { __typename small medium large } fragment ctaLink on CtaLink { __typename label link deeplink }",
        });

        let header = JSON.stringify({
          "X-APOLLO-OPERATION-NAME": "getCustomerOffers",
        });

        window.cordova.exec(
          (successData) => {
            console.error("Running function  => cordova success function");
            resolve(successData);
          },
          (errorData) => {
            console.error("Running function  => cordova error function");
            reject(errorData);
          },
          "gqlplugin", // The name of the native service. Such as plugin name.
          "request", // The action to execute. Such as function name. request
          [body, header, "POST"] // Arguments for the native service. Such as parameters.
        );
      } else {
        console.error("getDataFromJsBridge error: cordova not found");
        reject(
          new Error(
            "Cordova is not available. Failed to get data from JS bridge"
          )
        );
      }
    });
  }

  /**
   * Method to fetch RTIM Offer data
   *
   * Depending on the environment and Cordova plugin, it fetches the offer data either through the JS Bridge or using a mocked URL.
   * If the data is successfully retrieved, it invokes 'handleYearEndSpendPage' function after parsing the data
   * and invokes the handleErrorPage function if any error
   *
   */
  async fetchRTIMOfferData(callBackFn) {
    const that = this;
    try {
      if (window.cordova || window?.general?.environment === "prod") {
        let data = await that.getDataFromJsBridge();

        if (data) {
          if (typeof data === "string") {
            data = JSON.parse(data);
          }

          yearEndSpendOfferData = data?.data?.offers;
          callBackFn(that);
        }
      } else {
        const response = await fetch(window?.general?.mockDataUrl);
        let data = await response.json();

        if (data) {
          yearEndSpendOfferData = data?.data?.offers;
          setTimeout(() => {
            callBackFn(that);
          }, 2000);
        }
      }
    } catch (error) {
      that.handleErrorPage(
        `Failed to get RTIM offer data: ${error.message}`,
        "loader"
      );
      console.error("fetchRTIMOfferData error:", error);
    }
  }

  /**
   * Method to fetch the offer data and render the page based on RTIM Offer data
   *
   * Based on the environment and flag 'getDataFromRTIM' , this function decides whether to fetch offer data from RTIM or through mock URL.
   * Upon successful retrieval the data, it triggers the 'handleYearEndSpendPage' function after parsing the data if environment is not 'prod'
   * and invokes the handleErrorPage function if any error
   *
   */
  async handleYearEndSpendOffer() {
    const that = this;
    try {
      if (
        window?.general?.environment === "prod" &&
        window?.general?.getDataFromRTIM === true
      ) {
        that.fetchRTIMOfferData(that.handleYearEndSpendPage);
      } else {
        const response = await fetch(window?.general?.mockDataUrl);
        const data = await response.json();

        yearEndSpendOfferData = data?.data?.offers;

        setTimeout(() => {
          that.handleYearEndSpendPage(that);
        }, 2000);
      }
    } catch (error) {
      that.handleErrorPage(
        `Failed to fetch and handle offer data: ${error.message}`,
        "loader"
      );
      console.error("handleYearEndSpendOffer error:", error);
    }
  }

  /**
   * Fetches campaign configuration data from a specified URL.
   *
   * This method retrieves the campaign configuration JSON from the URL defined in `window.general.configJsonUrl`.
   * It parses and returns the response data. If the fetch fails or the response is not OK, an error is thrown.
   *
   * @async
   * @returns {Promise<Object>} Resolves with the parsed configuration data.
   * @throws {Error} If the fetch fails or the response is not OK.
   */
  async fetchCampaignConfigData() {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await fetch(window?.general?.configJsonUrl);
      if (!response.ok) {
        throw new Error(
          "Fetch campaign config data response was not ok " +
            response.statusText
        );
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("fetchCampaignConfigData error:", error);
      throw error;
    }
  }

  /**
   * Initiates the spend campaign flow by fetching campaign configuration data
   * and handling the year-end spend offer. Handles errors by displaying an error page
   * and logging the error to the console.
   *
   * @async
   * @returns {Promise<void>} Resolves when the campaign is initiated, or handles errors if any occur.
   */
  async initiateSpendCampaign() {
    const that = this;
    try {
      await this.fetchCampaignConfigData()
        .then((data) => {
          campaignConfigData = data[0].campaign;
        })
        .catch((error) => {
          throw error;
        });
      await this.handleYearEndSpendOffer();
    } catch (error) {
      that.handleErrorPage(
        `Failed to fetch config and offer data: ${error.message}`,
        "loader"
      );
      console.error("initiateSpendCampaign error:", error);
    }
  }
}

// Create a single instance
const instance = new ScYESGeneralScreen();

export default instance;
