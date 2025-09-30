/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
let yearEndSpendOfferData = null;
let campaignConfigData = null;

class ScYESGeneralScreen {
  constructor() {
    this.gameInstance = null;
    this.isRequireOfferUpdate = false;
    this.landingOffer = null;
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
    this.instructionSourcePage = "";
    this.isAfterGamePlay = false;
    this.isAutoModalShown = false;
    this.giftFlag = {
      dining: {
        restaurant1: false,
        restaurant2: false,
        restaurant3: false,
        restaurant4: false,
      },
      travel: {
        travel1: false,
        travel2: false,
        travel3: false,
        travel4: false,
      },
      luggage: false,
    };
    this.acquiredCardCount = {
      dining: {
        restaurant1: 0,
        restaurant2: 0,
        restaurant3: 0,
        restaurant4: 0,
      },
      travel: {
        travel1: 0,
        travel2: 0,
        travel3: 0,
        travel4: 0,
      },
      luggage: 0,
      grandPrize: 0,
      bonus: 0,
    };

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
    this.cardsCollectionTemplate = document.querySelector(
      ".sc-year-end-spend-card-collection-template"
    );
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

      // Set session storage items
      window.sessionStorage.setItem("packsCount", that.packsCount);
      window.sessionStorage.setItem(
        "issuedCardGroups",
        JSON.stringify(that.issuedCardGroups)
      );
      window.sessionStorage.setItem(
        "currentCardGroup",
        JSON.stringify(that.currentCardGroup)
      );

      // Get the error page back button and add a click event listener
      const errorPageBackButton = that.errorPage.querySelector(
        ".sc-year-end-spend-error__button-back"
      );
      errorPageBackButton.addEventListener("click", () => {
        that.handleExitCampaignPage();
      });

      that.initiatePageEvents();
      that.initiateSpendCampaign();
    } catch (error) {
      console.error("Running function  => init on Error", error);
      setTimeout(() => {
        const loader = document.querySelector(".sc-year-end-spend-loader");
        const errorPage = document.querySelector(".sc-year-end-spend-error");

        loader.classList.add("sc-year-end-spend-loader--hide");
        errorPage.classList.remove("sc-year-end-spend-error--hide");
      }, 2000);
    }
  }

  /**
   * Initializes all event listeners required for the general flow of the year-end spend campaign.
   * This includes setting up events for registration, confirmation, landing, check-in, profile customization,
   * instruction page, gameplay, card collection, reward popups and details, end campaign page,
   * common modals, and error pages. Additionally, attaches click event listeners to terms and conditions links.
   *
   * @throws {Error} Throws an error if any event initialization fails.
   */
  initiatePageEvents() {
    const that = this;
    // eslint-disable-next-line no-useless-catch
    try {
      that.initiateRegistrationPageEvents();
      that.initiateRegConfirmationPageEvents();
      that.initiateLandingPageEvents();
      that.initiateCheckinPageEvents();
      that.initiateProfilePageEvents();
      that.initiateInstructionPageEvents();
      that.initiateCardCollectionPageEvents();
      that.initiateRewardPopupEvents();
      that.initiateRewardDetailPopupEvents();
      that.initiateEndCampaignPageEvents();
      that.initiateCommonModalEvents();

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
        that.registrationPage.classList.add(
          "sc-year-end-spend-registration--hide"
        );
        that.showInstructionPage("registration");
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
        if (that.gameInstance && typeof that.gameInstance.init === "function") {
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
      });

      // Get the instruction back button and add a click event listener
      const instructionBackHomeButton = that.instructionPage.querySelector(
        ".sc-year-end-spend-instruction__bottom-back"
      );
      instructionBackHomeButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        that.closeInstructionPage();
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
      });

      // Get the how to unlock link and add a click event listener
      const collectionPageCloseButton = that.cardsCollectionPage.querySelector(
        ".sc-year-end-spend-card-collection__header-close"
      );
      collectionPageCloseButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        that.closeCardCollectionPage();
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

      // Get the play button from prize tab and add click event listeners
      const collectionPagePlayButton = that.cardsCollectionPage.querySelector(
        ".sc-year-end-spend-card-collection__tabs-prize-button-play"
      );
      collectionPagePlayButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        that.closeCardCollectionPage();
      });

      // Get the unlock button from prize tab and add click event listeners
      const collectionPageUnlockButton = that.cardsCollectionPage.querySelector(
        ".sc-year-end-spend-card-collection__tabs-prize-button-unlock"
      );
      collectionPageUnlockButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        that.showInstructionPage("card-collection");
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
        const rewardName =
          rewardDetailsShareLink.getAttribute("data-reward-name") || "";
        that.handleShareClick(rewardName);
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

  handleShareClick(rewardName) {
    try {
      let shareMessage = campaignConfigData?.reward?.share?.message || "";
      let shareImageUrl = campaignConfigData?.reward?.share?.image || "";

      if (!shareMessage) return;

      shareMessage = shareMessage.split("{{reward}}").join(rewardName);

      let inputObj = {
        shareTitle: "",
        shareSubject: "",
        shareMessage: shareMessage,
        shareImage: shareImageUrl,
      };

      if (window.cordova) {
        inputObj = {
          title: "",
          subject: "",
          message: shareMessage,
          shareImageUrl: shareImageUrl,
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
              that.handleErrorPage(
                `Failed to update impression: ${JSON.stringify(response)}`
              );
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
  handleClickImpressionOnEvent(
    sourceEle,
    onEvent,
    rewardValue,
    isAutoModal = false
  ) {
    const that = this;
    try {
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
          case "reward-acquired": {
            that.handleRewardRedemptionSuccess(sourceEle, rewardValue);
            break;
          }
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

        if (window.general.environment === "dev") {
          setTimeout(() => {
            that.handleGamePlayImpressionSuccess(rewardValue);
          }, 2000);
        }
      }

      if (onEvent === "reward-acquired") {
        impressionObj.contexts = [
          {
            type: "StatusUpdate",
            value: rewardValue,
            key: "Reward",
          },
        ];

        if (window.general.environment === "dev") {
          setTimeout(() => {
            that.handleRewardRedemptionSuccess(
              sourceEle,
              rewardValue,
              isAutoModal
            );
          }, 2000);
        }
      }

      that.updateClickImpression(impressionObj, successCallback);
    } catch (error) {
      that.handleErrorPage(
        `Failed to send click impression on event: ${error.message}`
      );
      console.error("handleClickImpressionOnEvent error:", error);
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
    try {
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
    } catch (error) {
      throw new Error(
        `Failed to group cards by property error: ${error.message}`
      );
    }
  }

  getGiftFlagValue(field, giftFlag) {
    try {
      if (
        field.name ===
          (campaignConfigData?.offer?.fields?.restaurant1GiftFlag ||
            "Restaurant1GiftFlag") &&
        field.value.toLowerCase() === "y"
      ) {
        giftFlag.dining.restaurant1 = true;
      }
      if (
        field.name ===
          (campaignConfigData?.offer?.fields?.restaurant2GiftFlag ||
            "Restaurant2GiftFlag") &&
        field.value.toLowerCase() === "y"
      ) {
        giftFlag.dining.restaurant2 = true;
      }
      if (
        field.name ===
          (campaignConfigData?.offer?.fields?.restaurant3GiftFlag ||
            "Restaurant3GiftFlag") &&
        field.value.toLowerCase() === "y"
      ) {
        giftFlag.dining.restaurant3 = true;
      }
      if (
        field.name ===
          (campaignConfigData?.offer?.fields?.restaurant4GiftFlag ||
            "Restaurant4GiftFlag") &&
        field.value.toLowerCase() === "y"
      ) {
        giftFlag.dining.restaurant4 = true;
      }
      if (
        field.name ===
          (campaignConfigData?.offer?.fields?.travel1GiftFlag ||
            "Travel1GiftFlag") &&
        field.value.toLowerCase() === "y"
      ) {
        giftFlag.travel.travel1 = true;
      }
      if (
        field.name ===
          (campaignConfigData?.offer?.fields?.travel2GiftFlag ||
            "Travel2GiftFlag") &&
        field.value.toLowerCase() === "y"
      ) {
        giftFlag.travel.travel2 = true;
      }
      if (
        field.name ===
          (campaignConfigData?.offer?.fields?.travel3GiftFlag ||
            "Travel3GiftFlag") &&
        field.value.toLowerCase() === "y"
      ) {
        giftFlag.travel.travel3 = true;
      }
      if (
        field.name ===
          (campaignConfigData?.offer?.fields?.travel4GiftFlag ||
            "Travel4GiftFlag") &&
        field.value.toLowerCase() === "y"
      ) {
        giftFlag.travel.travel4 = true;
      }
      if (
        field.name ===
          (campaignConfigData?.offer?.fields?.luggageGiftFlag ||
            "LuggageGiftFlag") &&
        field.value.toLowerCase() === "y"
      ) {
        giftFlag.luggage = true;
      }

      return giftFlag;
    } catch (error) {
      throw new Error(`Failed to get gift flag value error: ${error.message}`);
    }
  }

  getAcquiredCountValue(field, acquiredCount) {
    try {
      if (
        field.name ===
          (campaignConfigData?.offer?.fields?.restaurant1AcquiredCount ||
            "Restaurant1AcquiredCardCount") &&
        field.value
      ) {
        acquiredCount.dining.restaurant1 = parseInt(field.value);
      }
      if (
        field.name ===
          (campaignConfigData?.offer?.fields?.restaurant2AcquiredCount ||
            "Restaurant2AcquiredCardCount") &&
        field.value
      ) {
        acquiredCount.dining.restaurant2 = parseInt(field.value);
      }
      if (
        field.name ===
          (campaignConfigData?.offer?.fields?.restaurant3AcquiredCount ||
            "Restaurant3AcquiredCardCount") &&
        field.value
      ) {
        acquiredCount.dining.restaurant3 = parseInt(field.value);
      }
      if (
        field.name ===
          (campaignConfigData?.offer?.fields?.restaurant4AcquiredCount ||
            "Restaurant4AcquiredCardCount") &&
        field.value
      ) {
        acquiredCount.dining.restaurant4 = parseInt(field.value);
      }
      if (
        field.name ===
          (campaignConfigData?.offer?.fields?.travel1AcquiredCount ||
            "Travel1AcquiredCardCount") &&
        field.value
      ) {
        acquiredCount.travel.travel1 = parseInt(field.value);
      }
      if (
        field.name ===
          (campaignConfigData?.offer?.fields?.travel2AcquiredCount ||
            "Travel2AcquiredCardCount") &&
        field.value
      ) {
        acquiredCount.travel.travel2 = parseInt(field.value);
      }
      if (
        field.name ===
          (campaignConfigData?.offer?.fields?.travel3AcquiredCount ||
            "Travel3AcquiredCardCount") &&
        field.value
      ) {
        acquiredCount.travel.travel3 = parseInt(field.value);
      }
      if (
        field.name ===
          (campaignConfigData?.offer?.fields?.travel4AcquiredCount ||
            "Travel4AcquiredCardCount") &&
        field.value
      ) {
        acquiredCount.travel.travel4 = parseInt(field.value);
      }
      if (
        field.name ===
          (campaignConfigData?.offer?.fields?.luggageAcquiredCount ||
            "LuggageAcquiredCardCount") &&
        field.value
      ) {
        acquiredCount.luggage = parseInt(field.value);
      }
      if (
        field.name ===
          (campaignConfigData?.offer?.fields?.grandPrizeAcquiredCount ||
            "grandPrizeAcquiredCardCount") &&
        field.value
      ) {
        acquiredCount.grandPrize = parseInt(field.value);
      }
      if (
        field.name ===
          (campaignConfigData?.offer?.fields?.bonusAcquiredCount ||
            "BonusCardAcquiredCardCount") &&
        field.value
      ) {
        acquiredCount.bonus = parseInt(field.value);
      }

      return acquiredCount;
    } catch (error) {
      throw new Error(
        `Failed to get acquired count value error: ${error.message}`
      );
    }
  }

  setSummaryOfferValues(offerData) {
    // eslint-disable-next-line no-useless-catch
    const that = this;
    try {
      if (typeof offerData === "object" && offerData !== null) {
        const { acquiredRewards, acquiredCardCount, giftFlag } =
          offerData.fields.reduce(
            (acc, field) => {
              if (
                field.name ===
                  (campaignConfigData?.offer?.fields?.allRewards ||
                    "AllRewards") &&
                field.value
              ) {
                acc.acquiredRewards = JSON.parse(field.value);
              }

              acc.acquiredCardCount = that.getAcquiredCountValue(
                field.name,
                acc.acquiredCardCount
              );
              acc.giftFlag = that.getGiftFlagValue(field, acc.giftFlag);

              return acc;
            },
            {
              acquiredRewards: [],
              acquiredCardCount: that.acquiredCardCount,
              giftFlag: that.giftFlag,
            }
          );

        that.acquiredRewards = acquiredRewards;
        that.acquiredCardCount = acquiredCardCount;
        that.giftFlag = giftFlag;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Sets offer-related values from the provided offer data object.
   *
   * This method extracts various fields from the `offerData` object, updates the instance properties accordingly,
   * groups issued cards, and stores relevant values in `sessionStorage`. It expects `offerData.fields` to be an array
   * of field objects with `name` and `value` properties. The method also relies on the `campaignConfigData` global/config object
   * for field name mappings.
   *
   * @param {Object} offerData - The offer data object containing fields to extract and set.
   * @param {Array<Object>} offerData.fields - Array of field objects, each with `name` and `value` properties.
   * @param {string|number} offerData.id - The identifier for the offer, used for conditional logic.
   *
   * @throws {Error} Throws an error if processing the offer data fails.
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
          acquiredCardCount,
          giftFlag,
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
                campaignConfigData?.offer?.groupId || "RewardGroupID"
              );
            }
            if (
              field.name ===
                (campaignConfigData?.offer?.fields?.allRewards ||
                  "AllRewards") &&
              field.value
            ) {
              acc.issuedRewards = JSON.parse(field.value);
            }
            acc.acquiredCardCount = that.getAcquiredCountValue(
              field,
              acc.acquiredCardCount
            );
            acc.giftFlag = that.getGiftFlagValue(field, acc.giftFlag);

            return acc;
          },
          {
            isRegistered: false,
            campaignExpiryDate: "",
            packsCount: 0,
            issuedCards: [],
            issuedRewards: [],
            acquiredCardCount: that.acquiredCardCount,
            giftFlag: that.giftFlag,
          }
        );

        that.isRegistered = isRegistered;
        that.campaignExpiryDate = campaignExpiryDate;
        that.packsCount = packsCount;
        that.issuedCards = issuedCards;
        that.issuedCardGroups = issuedCardGroups;
        that.issuedRewards = issuedRewards;
        that.acquiredCardCount = acquiredCardCount;
        that.giftFlag = giftFlag;

        // Store values in sessionStorage
        window.sessionStorage.setItem("packsCount", packsCount);
        window.sessionStorage.setItem(
          "issuedCardGroups",
          JSON.stringify(issuedCardGroups)
        );
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Sets game page attributes based on the provided offer data.
   * If the user has remaining packs (as stored in sessionStorage), it locates the game container
   * and adds impression attributes to it. Handles errors by displaying an error page and logging the error.
   *
   * @param {Object} offerData - The data related to the current offer, used to set impression attributes.
   */
  setGamePageAttributes(offerData) {
    const that = this;
    try {
      if (parseInt(window.sessionStorage.getItem("packsCount")) > 0) {
        const gameContainer = that.gamePlayPage.querySelector(
          ".sc-year-end-spend-polaroid-game__wrapper"
        );

        that.addImpressionAttributes(offerData, [gameContainer]);
      }
    } catch (error) {
      throw new Error(
        `Failed to set game page attributes error: ${error.message}`
      );
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

  handleRewardRedemptionSuccess(sourceEle, rewardValue, isAutoModal) {
    const that = this;
    try {
      if (isAutoModal === true && that.isAutoModalShown === false) {
        that.isAutoModalShown = true;
        // invoke auto popup
      } else {
        let earnedReward = that.issuedRewards.filter(
          (reward) => reward["Reward"] === rewardValue
        );
        that.issuedRewards = that.issuedRewards.filter(
          (reward) => reward["Reward"] !== rewardValue
        );
        that.acquiredRewards = [...that.acquiredRewards, ...earnedReward];
        that.handleRewardDetailsModal(sourceEle);
      }
    } catch (error) {
      that.handleErrorPage(
        `Failed to handle reward redemption success: ${error.message}`,
        "loader"
      );
      console.error("handleRewardRedemptionSuccess error:", error);
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

      this.isAfterGamePlay = true;
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
      setTimeout(() => {
        that.gameInstance.executePocketFadeOut(rewardValue);
      }, that.gameInstance.CONFIG.TIMING.POCKET_DELAY);

      // that.gameInstance.showGameResult(rewardValue);
    } catch (error) {
      that.handleErrorPage(
        `Failed to handle game play impression success: ${error.message}`
      );
      console.error("handleGamePlayImpressionSuccess error:", error);
    }
  }

  /**
   * Closes the card collection page by adding a CSS class to hide it.
   * Navigates back to the landing page.
   * Handles any errors that occur during the process and logs them.
   *
   * @returns {void}
   */
  closeCardCollectionPage() {
    try {
      this.cardsCollectionPage.classList.add(
        "sc-year-end-spend-card-collection--hide"
      );
      this.showLandingPage();
    } catch (error) {
      this.handleErrorPage(
        `Failed to close card collection page: ${error.message}`
      );
      console.error("closeCardCollectionPage error:", error);
    }
  }

  /**
   * Displays the card collection page and initializes its state.
   *
   * Sets the source page, activates the "my-cards" tab by default,
   * toggles the appropriate tab and content, shows the loader,
   * and fetches RTIM offer data to populate the card collection page.
   * Handles and logs errors if any step fails.
   *
   * @param {string} [sourcePage=''] - The identifier of the page from which the card collection page is accessed.
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
      that.loader.classList.remove("sc-year-end-spend-loader--hide");
      that.fetchRTIMOfferData(that.handleCardCollectionPage);
    } catch (error) {
      that.handleErrorPage(
        `Failed to show card collection page: ${error.message}`
      );
      console.error("showCardCollectionPage error:", error);
    }
  }

  /**
   * Closes the instruction page by adding a CSS class to hide it.
   * Navigates back to the appropriate source page (registration or landing).
   * Handles any errors that occur during the process and logs them.
   *
   * @returns {void}
   * */
  closeInstructionPage() {
    const that = this;
    try {
      this.instructionPage.classList.add("sc-year-end-spend-instruction--hide");

      if (that.instructionSourcePage === "registration")
        that.registrationPage.classList.remove(
          "sc-year-end-spend-registration--hide"
        );
      else that.showLandingPage();
      // that.landingPage.classList.remove('sc-year-end-spend-landing--hide');
    } catch (error) {
      this.handleErrorPage(
        `Failed to close instruction page: ${error.message}`
      );
      console.error("closeInstructionPage error:", error);
    }
  }

  /**
   * Displays the instruction page based on the provided source page.
   * Handles tab activation, pack count display, and visibility of instruction sections.
   * Also manages hiding the game section if invoked from the game screen.
   *
   * @param {string} [sourcePage='landing'] - The source page from which the instruction page is invoked.
   *   Possible values: 'landing', 'registration', 'game-screen'.
   *   - 'landing': Shows the instruction tab and displays the packs count.
   *   - 'registration': Hides the packs count section.
   *   - 'game-screen': Hides the game section before showing instructions.
   *
   * @throws Will call handleErrorPage and log to console if an error occurs while displaying the instruction page.
   */
  showInstructionPage(sourcePage = "landing") {
    const that = this;
    try {
      that.instructionSourcePage = sourcePage;
      let initialActiveTab = that.instructionPage.querySelector(
        '.sc-year-end-spend-instruction__tabs-button[data-tabid="unlock-packs-tab"]'
      );
      const instructionBottom = that.instructionPage.querySelector(
        ".sc-year-end-spend-instruction__bottom"
      );
      const packsCountEle = that.instructionPage.querySelector(
        ".sc-year-end-spend-instruction__bottom-packs"
      );

      packsCountEle.textContent = parseInt(
        window.sessionStorage.getItem("packsCount"),
        10
      );
      instructionBottom.classList.remove(
        "sc-year-end-spend-instruction__bottom--hide"
      );

      if (sourcePage === "registration")
        instructionBottom.classList.add(
          "sc-year-end-spend-instruction__bottom--hide"
        );

      if (sourcePage === "landing")
        initialActiveTab = that.instructionPage.querySelector(
          '.sc-year-end-spend-instruction__tabs-button[data-tabid="instruction-tab"]'
        );

      if (sourcePage === "game-screen") that.gameInstance.hideGameSection(); // need to inform them to hide and call showInstructionPage function

      that.handleTabToggle(
        initialActiveTab,
        that.instructionPage,
        ".sc-year-end-spend-instruction__tabs-button",
        ".sc-year-end-spend-instruction__tabs-content"
      );
      that.instructionPage.classList.remove(
        "sc-year-end-spend-instruction--hide"
      );
    } catch (error) {
      that.handleErrorPage(`Failed to show instruction page: ${error.message}`);
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
      if (that.isAfterGamePlay === true) {
        that.isRequireOfferUpdate = true;
        that.isAfterGamePlay = false;
        that.loader.classList.remove("sc-year-end-spend-loader--hide");
        that.fetchRTIMOfferData(that.handleLandingPage);
      } else {
        const packsCountEle = that.landingPage.querySelector(
          ".sc-year-end-spend-landing__packs-count"
        );
        if (packsCountEle)
          packsCountEle.textContent = parseInt(
            window.sessionStorage.getItem("packsCount"),
            10
          );

        that.landingPage.classList.remove("sc-year-end-spend-landing--hide");
      }
    } catch (error) {
      that.handleErrorPage(`Failed to show landing page: ${error.message}`);
      console.error("showLandingPage error:", error);
    }
  }

  /**
   * Expands the first accordion (tile) in the currently active tab and collapses all others.
   * The behavior adapts based on the provided source page name, supporting both the instruction page
   * and the card collection page, with special handling for the "my-cards" tab.
   *
   * @param {string} [sourcePageName='instruction'] - The source page context.
   *        Accepts 'instruction' (default) or 'card-collection'.
   * @throws {Error} Throws an error if the expansion or collapse operation fails.
   */
  expandFirstAccordianInActiveTab(sourcePageName = "instruction") {
    const that = this;
    try {
      let accordionClass = "sc-year-end-spend-instruction__tabs-tile";
      let activeTabContent = that.instructionPage.querySelector(
        ".sc-year-end-spend-instruction__tabs-content.active"
      );

      if (sourcePageName === "card-collection") {
        activeTabContent = that.cardsCollectionPage.querySelector(
          ".sc-year-end-spend-card-collection__tabs-content.active"
        );
        accordionClass = "sc-year-end-spend-card-collection__tabs-prize-tile";

        if (activeTabContent.id === "my-cards")
          accordionClass = "has-cards-collected";
      }

      // Expand the first tile and collapse the rest
      const accordions = activeTabContent.querySelectorAll(
        `.${accordionClass}`
      );
      accordions.forEach((accordion, index) =>
        accordion.classList.toggle("expanded", index === 0)
      );
    } catch (error) {
      throw new Error(
        `Failed to expand first accordion and collapse others in active tab: ${error.message}`
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
        const isActiveTabContent =
          allTabContents[index].id === eventTarget.getAttribute("data-tabid");

        tab.classList.toggle("active", isActive);
        allTabContents[index].classList.toggle(
          "active",
          isActive && isActiveTabContent
        );
      });

      if (tabClass.includes("card-collection"))
        this.expandFirstAccordianInActiveTab("card-collection");
      else this.expandFirstAccordianInActiveTab("instruction");
    } catch (error) {
      throw new Error(`Failed to toggle tabs: ${error.message}`);
    }
  }

  /**
   * Toggles the expanded state of an accordion element within a parent container.
   * When expanding, collapses all other expanded accordions in the same parent.
   *
   * @param {HTMLElement} eventTarget - The element that triggered the toggle event.
   * @param {string} parentContainerClass - The CSS class name of the parent container for the accordion.
   * @param {boolean} [expand=true] - Whether to expand (true) or collapse (false) the accordion.
   * @throws {Error} Throws an error if the toggle operation fails.
   */
  handleAccordianToggle(eventTarget, parentContainerClass, expand = true) {
    try {
      const parentContainer = eventTarget.closest(`.${parentContainerClass}`);
      if (expand) {
        // Collapse all other expanded accordions in the same parent
        const allAccordions = parentContainer.parentElement.querySelectorAll(
          `.${parentContainerClass}.expanded`
        );

        allAccordions.forEach((acc) =>
          acc.classList.toggle("expanded", acc === parentContainer)
        );
      }
      parentContainer.classList.toggle("expanded", expand);
    } catch (error) {
      throw new Error(`Failed to toggle accordion: ${error.message}`);
    }
  }

  handleRewardDetailsModal(eventTarget) {
    const that = this;
    try {
      const rewardConfig = campaignConfigData["reward"];
      const rewardProvider =
        eventTarget.getAttribute("data-reward-provider") || "";
      const rewardType = eventTarget.getAttribute("data-reward-type") || "";
      const rewardValue = eventTarget.getAttribute("data-reward-value") || "";

      const modalRewardImageList = that.rewardDetailsModal.querySelectorAll(
        ".sc-year-end-spend-reward-details__card-stack img"
      );
      const modalTitleEle = that.rewardDetailsModal.querySelector(
        ".sc-year-end-spend-reward-details__reward-title"
      );
      const modalExpiryEle = that.rewardDetailsModal.querySelector(
        ".sc-year-end-spend-reward-details__expiry"
      );
      const modalRedeemMessageEle = that.rewardDetailsModal.querySelector(
        ".sc-year-end-spend-reward-details__redeem-message"
      );
      const modalTermsLink = that.rewardDetailsModal.querySelector(
        ".sc-year-end-spend-reward-details__terms-link"
      );
      const modalShareLink = that.rewardDetailsModal.querySelector(
        ".sc-year-end-spend-reward-details__share-link"
      );
      let rewardTitle = "",
        rewardImage = "";

      if (rewardType === "luggage") {
        rewardTitle = rewardProvider;
        rewardImage = rewardConfig[rewardType]["image"] || "";
      } else {
        rewardTitle = rewardConfig[rewardType][rewardProvider]["title"] || "";
        rewardImage = rewardConfig[rewardType][rewardProvider]["image"] || "";
      }

      modalRewardImageList.forEach((imageEle) => {
        imageEle.src = rewardImage;
        imageEle.alt = `${rewardType}-reward-image`;
      });

      if (modalTitleEle) modalTitleEle.textContent = rewardTitle.trim();
      if (modalExpiryEle)
        modalExpiryEle.textContent = rewardConfig[rewardType]["expiry"] || "";
      if (modalRedeemMessageEle)
        modalRedeemMessageEle.textContent = rewardValue;
      if (modalTermsLink)
        modalTermsLink.setAttribute(
          "data-link",
          rewardConfig[rewardType]["termsLink"] || ""
        );
      if (modalShareLink)
        modalShareLink.setAttribute("data-reward-name", rewardTitle.trim());

      that.rewardDetailsModal.classList.remove(
        "sc-year-end-spend-reward-details--hide"
      );
    } catch (error) {
      throw new Error(
        `Failed to handle reward details modal: ${error.message}`
      );
    }
  }

  addRewardMapping(
    rewardTile,
    rewardProvider,
    rewardType = "luggage",
    isPrizeTile = false
  ) {
    const that = this;
    try {
      let earnedReward = that.acquiredRewards.filter((reward) => {
        if (rewardType === "luggage")
          return reward["RewardType"].toLowerCase() === rewardType;
        else
          return (
            reward["RewardProvider"].toLowerCase() === rewardProvider &&
            reward["RewardType"].toLowerCase() === rewardType
          );
      });

      if (earnedReward.length === 0) {
        earnedReward = that.issuedRewards.filter((reward) => {
          if (rewardType === "luggage")
            return reward["RewardType"].toLowerCase() === rewardType;
          else
            return (
              reward["RewardProvider"].toLowerCase() === rewardProvider &&
              reward["RewardType"].toLowerCase() === rewardType
            );
        });
      }

      if (earnedReward.length === 0)
        throw new Error(
          `Reward not found for: ${rewardType}-${rewardProvider}`
        );

      if (rewardTile && earnedReward.length > 0) {
        const viewRewardDetailsButton = rewardTile.querySelector(
          ".sc-year-end-spend-card-collection__reward-view-details, " +
            ".sc-year-end-spend-card-collection__tabs-prize-tile-info"
        );

        if (rewardType === "luggage") {
          rewardProvider = earnedReward[0]["RewardProvider"] || "";

          if (isPrizeTile === true) {
            const rewardName = rewardTile.querySelector(
              ".sc-year-end-spend-card-collection__tabs-prize-tile-name"
            );

            if (rewardName) rewardName.textContent = rewardProvider;
          }
        }

        if (viewRewardDetailsButton) {
          viewRewardDetailsButton.setAttribute(
            "data-reward-provider",
            rewardProvider
          );
          viewRewardDetailsButton.setAttribute("data-reward-type", rewardType);
          viewRewardDetailsButton.setAttribute(
            "data-reward-value",
            earnedReward[0]["Reward"] || ""
          );

          viewRewardDetailsButton.addEventListener("click", (event) => {
            try {
              event.preventDefault();
              event.stopPropagation();

              if (earnedReward[0]["RewardStatus"].toLowerCase() === "issued") {
                that.addImpressionAttributes(that.landingOffer, [
                  viewRewardDetailsButton,
                ]);
                that.handleClickImpressionOnEvent(
                  viewRewardDetailsButton,
                  "reward-acquired",
                  earnedReward[0]["Reward"]
                );
              } else that.handleRewardDetailsModal(viewRewardDetailsButton);
            } catch (error) {
              that.handleErrorPage(
                `Failed to handle reward details click event: ${error.message}`
              );
            }
          });
        }
      }
    } catch (error) {
      throw new Error(`Failed to add reward mapping data: ${error.message}`);
    }
  }

  handlePrizeTabTileData(giftFlag, rewardCategory) {
    const that = this;
    try {
      let rewardCount = 0;
      const rewardConfig = campaignConfigData["reward"];
      const rewardTileWrapper = that.cardsCollectionPage.querySelector(
        `.sc-year-end-spend-card-collection__tabs-prize-tile-${rewardCategory} 
        .sc-year-end-spend-card-collection__tabs-prize-tile-wrapper`
      );
      const parentTile = rewardTileWrapper.closest(
        ".sc-year-end-spend-card-collection__tabs-prize-tile"
      );
      const rewardTemplate = that.cardsCollectionTemplate.querySelector(
        ".sc-year-end-spend-card-collection__tabs-prize-tile-content"
      );

      rewardTileWrapper.innerHTML = "";

      for (const key in giftFlag) {
        if (!Object.hasOwn(giftFlag, key)) continue;

        const rewardTile = rewardTemplate.cloneNode(true);

        if (giftFlag[key] === true && rewardTile) {
          const rewardName = rewardTile.querySelector(
            ".sc-year-end-spend-card-collection__tabs-prize-tile-name"
          );
          const tileSplitter = that.cardsCollectionTemplate
            .querySelector(
              ".sc-year-end-spend-card-collection__tabs-prize-tile-line"
            )
            .cloneNode(true);

          if (rewardName && rewardCategory !== "luggage")
            rewardName.textContent = rewardConfig[rewardCategory][key]["name"];

          rewardCount = rewardCount + 1;
          that.addRewardMapping(rewardTile, key, rewardCategory, true);
          rewardTileWrapper.appendChild(rewardTile);
          rewardTileWrapper.appendChild(tileSplitter);
        }
      }

      if (rewardCount > 0 && parentTile) {
        const tileNumberEle = parentTile.querySelector(
          ".sc-year-end-spend-card-collection__tabs-prize-tile-number"
        );

        if (tileNumberEle) tileNumberEle.textContent = rewardCount;
        parentTile.classList.add("has-prize-collected");
      }
    } catch (error) {
      throw new Error(`Failed to render prize tab tile data: ${error.message}`);
    }
  }

  handlePrizeCollectionTabsData() {
    const that = this;
    try {
      const acquiredCardCountObj = that.acquiredCardCount;
      const giftFlag = that.giftFlag;

      for (const key in acquiredCardCountObj) {
        if (!Object.hasOwn(acquiredCardCountObj, key)) continue;

        const cardCount = acquiredCardCountObj[key];

        switch (key) {
          case "grandPrize": {
            const grandPrizeCount = that.cardsCollectionPage.querySelector(
              ".sc-year-end-spend-card-collection__grandprize-prize-acquired"
            );

            if (grandPrizeCount) grandPrizeCount.textContent = cardCount;
            break;
          }
          case "dining":
            that.handlePrizeTabTileData(giftFlag[key], key);
            break;
          case "travel":
            that.handlePrizeTabTileData(giftFlag[key], key);
            break;
          case "luggage":
            that.handlePrizeTabTileData(giftFlag, key);
            break;
          //   case 'bonus':
          //     that.handleBonusTileData(cardCount);
          //     break;
          //   default:
          //     break;
        }
      }
    } catch (error) {
      throw new Error(
        `Failed to render prize collection tabs: ${error.message}`
      );
    }
  }

  handleRewardTileData(cardCountObj, giftFlag, rewardCategory) {
    const that = this;
    try {
      const rewardConfig = campaignConfigData["reward"][rewardCategory];
      const cardLimit = rewardConfig["cardLimit"];
      const rewardTileWrapper = that.cardsCollectionPage.querySelector(
        `.sc-year-end-spend-card-collection__tabs-tile-${rewardCategory} 
        .sc-year-end-spend-card-collection__tabs-tile-wrapper`
      );
      const rewardTemplate = that.cardsCollectionTemplate.querySelector(
        ".sc-year-end-spend-card-collection__tabs-reward"
      );

      rewardTileWrapper.innerHTML = "";

      for (const key in cardCountObj) {
        if (!Object.hasOwn(cardCountObj, key)) continue;

        const cardCount = cardCountObj[key];
        const rewardTile = rewardTemplate.cloneNode(true);

        if (rewardTile) {
          if (cardCount >= cardLimit && giftFlag[key] === true) {
            rewardTile.classList.add("all-cards-collected");
            that.addRewardMapping(rewardTile, key, rewardCategory);
          } else if (
            (cardCount < cardLimit && giftFlag[key] === true) ||
            (cardCount >= cardLimit && giftFlag[key] === false)
          )
            throw new Error(
              `${
                String(key).charAt(0).toUpperCase() + String(key).slice(1)
              } card count and gift flag do not match the criteria`
            );
        }

        const rewardCardTitle = rewardTile.querySelector(
          ".sc-year-end-spend-card-collection__tabs-reward-title"
        );
        const rewardCardImage = rewardTile.querySelectorAll(
          ".sc-year-end-spend-card-collection__tabs-reward-cards-image img"
        );
        const rewardCardCountEle = rewardTile.querySelector(
          ".sc-year-end-spend-card-collection__reward-cards-acquired"
        );
        const rewardCardLimitEle = rewardTile.querySelector(
          ".sc-year-end-spend-card-collection__reward-cards-limit"
        );

        if (rewardCardTitle)
          rewardCardTitle.textContent = rewardConfig[key]["name"];
        if (rewardCardCountEle) rewardCardCountEle.textContent = cardCount;
        if (rewardCardLimitEle) rewardCardLimitEle.textContent = cardLimit;

        rewardCardImage.forEach((cardImage, index) => {
          if (index + 1 <= cardCount) {
            cardImage.src = rewardConfig[key]["image"];
            cardImage.alt = `${key}-prize-card`;
          }
        });

        if (cardCount > 0 && rewardTileWrapper) {
          if (rewardTileWrapper.children.length > 0) {
            const tileSplitter = that.cardsCollectionTemplate
              .querySelector(
                ".sc-year-end-spend-card-collection__tabs-tile-line"
              )
              .cloneNode(true);
            rewardTileWrapper.appendChild(tileSplitter);
          }

          const parentTile = rewardTileWrapper.closest(
            ".sc-year-end-spend-card-collection__tabs-tile"
          );
          parentTile.classList.add("has-cards-collected");
          rewardTileWrapper.appendChild(rewardTile);
        }
      }
    } catch (error) {
      throw new Error(`Failed to render reward tile data: ${error.message}`);
    }
  }

  handleBonusTileData(cardCount) {
    const that = this;
    try {
      const bonusConfig = campaignConfigData["reward"]["bonus"];
      const bonusImageWrapper = that.cardsCollectionPage.querySelector(
        ".sc-year-end-spend-card-collection__tabs-bonus-cards"
      );

      if (bonusImageWrapper) {
        for (let index = 0; index < cardCount; index++) {
          const imgElement = document.createElement("img");
          imgElement.src = bonusConfig["image"];
          imgElement.alt = "bonus-prize-card";
          bonusImageWrapper.appendChild(imgElement);
        }

        if (cardCount > 0) {
          const parentTile = bonusImageWrapper.closest(
            ".sc-year-end-spend-card-collection__tabs-tile"
          );
          parentTile.classList.add("has-cards-collected");
        }
      }
    } catch (error) {
      throw new Error(`Failed to render bonus tile data: ${error.message}`);
    }
  }

  handleLuggageTileData(cardCount, giftFlag, key) {
    const that = this;
    try {
      const luggageConfig = campaignConfigData["reward"][key];
      const cardLimit = luggageConfig["cardLimit"];
      const luggageTile = that.cardsCollectionPage.querySelector(
        ".sc-year-end-spend-card-collection__tabs-luggage"
      );

      if (luggageTile) {
        if (cardCount > 0) {
          const parentTile = luggageTile.closest(
            ".sc-year-end-spend-card-collection__tabs-tile"
          );
          parentTile.classList.add("has-cards-collected");
        }
        if (cardCount >= cardLimit && giftFlag[key] === true) {
          luggageTile.classList.add("all-cards-collected");
          that.addRewardMapping(luggageTile, key);
        } else if (
          (cardCount < cardLimit && giftFlag[key] === true) ||
          (cardCount >= cardLimit && giftFlag[key] === false)
        )
          throw new Error(
            "Luggage card count and gift flag do not match the criteria"
          );
      }

      const luggageCardImage = luggageTile.querySelectorAll(
        ".sc-year-end-spend-card-collection__tabs-luggage-cards img"
      );
      const luggageCardCountEle = luggageTile.querySelector(
        ".sc-year-end-spend-card-collection__luggage-cards-acquired"
      );
      const luggageCardLimitEle = luggageTile.querySelector(
        ".sc-year-end-spend-card-collection__luggage-cards-limit"
      );

      if (luggageCardCountEle) luggageCardCountEle.textContent = cardCount;
      if (luggageCardLimitEle) luggageCardLimitEle.textContent = cardLimit;

      luggageCardImage.forEach((cardImage, index) => {
        if (index + 1 <= cardCount) {
          cardImage.src = luggageConfig["image"];
          cardImage.alt = "luggage-prize-card";
        }
      });
    } catch (error) {
      throw new Error(`Failed to render luggage tile data: ${error.message}`);
    }
  }

  handleCardCollectionTabData() {
    const that = this;
    try {
      const acquiredCardCountObj = that.acquiredCardCount;
      const giftFlag = that.giftFlag;

      for (const key in acquiredCardCountObj) {
        if (!Object.hasOwn(acquiredCardCountObj, key)) continue;

        const cardCount = acquiredCardCountObj[key];

        switch (key) {
          case "grandPrize": {
            const grandPrizeCount = that.cardsCollectionPage.querySelector(
              ".sc-year-end-spend-card-collection__grandprize-cards-acquired"
            );

            if (grandPrizeCount) grandPrizeCount.textContent = cardCount;
            break;
          }
          case "dining":
            that.handleRewardTileData(cardCount, giftFlag[key], key);
            break;
          case "travel":
            that.handleRewardTileData(cardCount, giftFlag[key], key);
            break;
          case "luggage":
            that.handleLuggageTileData(cardCount, giftFlag, key);
            break;
          case "bonus":
            that.handleBonusTileData(cardCount);
            break;
          default:
            break;
        }
      }
    } catch (error) {
      throw new Error(`Failed to render card collection tab: ${error.message}`);
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
  handleCardCollectionPage(that) {
    try {
      if (that.isAfterGamePlay === true) {
        const landingOfferId =
          campaignConfigData?.offer?.landing || "EGCCYESLanding";

        const landingOffer = Array.isArray(yearEndSpendOfferData?.offers)
          ? yearEndSpendOfferData.offers.filter(
              (offer) => offer?.id === landingOfferId
            )[0]
          : null;

        if (typeof landingOffer === "object" && landingOffer !== null) {
          that.setOfferValues(landingOffer);
          that.landingOffer = landingOffer;
          that.isAfterGamePlay = false;
        } else {
          throw new Error("Year end spend landing offer is not available");
        }
      }

      const summaryOfferId =
        campaignConfigData?.offer?.summary || "EGCCYESSummary";
      const summaryOffer = Array.isArray(yearEndSpendOfferData?.offers)
        ? yearEndSpendOfferData.offers.filter(
            (offer) => offer?.id === summaryOfferId
          )[0]
        : null;

      if (typeof summaryOffer === "object" && summaryOffer !== null) {
        that.setSummaryOfferValues(summaryOffer);
        that.handleCardCollectionTabData();
        that.handlePrizeCollectionTabsData();
        that.expandFirstAccordianInActiveTab("card-collection");

        const packsCount = parseInt(
          window.sessionStorage.getItem("packsCount"),
          10
        );
        if (packsCount === 0) {
          that.cardsCollectionPage.classList.add("zero-packs");
        } else {
          that.cardsCollectionPage.classList.remove("zero-packs");
        }

        that.addImpressionAttributes(summaryOffer, [that.cardsCollectionPage]);
        that.updateViewImpression(that.cardsCollectionPage);
        that.loader.classList.add("sc-year-end-spend-loader--hide");
        that.cardsCollectionPage.classList.remove(
          "sc-year-end-spend-card-collection--hide"
        );
      } else {
        throw new Error("Year end spend summary offer is not available");
      }
    } catch (error) {
      that.handleErrorPage(
        `Failed to render card collection page: ${error.message}`
      );
      console.error("handleCardCollectionPage error:", error);
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
        if (that.isRequireOfferUpdate === true) {
          that.setOfferValues(expectedOffer);
          that.landingOffer = expectedOffer;
          that.isRequireOfferUpdate = false;
        }

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
        if (packsCountEle) packsCountEle.textContent = packsCount;

        if (packsCount === 0) {
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
      that.handleErrorPage(`Failed to render landing page: ${error.message}`);
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
        try {
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
        } catch (error) {
          that.handleErrorPage(
            `Failed to handle Get Started button click: ${error.message}`
          );
          console.error("Get Started button click error:", error);
        }
      });

      that.loader.classList.add("sc-year-end-spend-loader--hide");
      that.regConfirmationPage.classList.remove(
        "sc-year-end-spend-reg-confirmation--hide"
      );
    } catch (error) {
      that.handleErrorPage(
        `Failed to render registration confirmation page: ${error.message}`
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
        `Failed to handle registration click: ${error.message}`
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
        `Failed to render registration page: ${error.message}`
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
        `Failed to render end campaign page: ${error.message}`
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
        `Failed to initialize year end spend page: ${error.message}`
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
      that.handleErrorPage(`Failed to get RTIM offer data: ${error.message}`);
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
        `Failed to fetch and handle offer data: ${error.message}`
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
        `Failed to fetch config and offer data: ${error.message}`
      );
      console.error("initiateSpendCampaign error:", error);
    }
  }
}

// Create a single instance
const instance = new ScYESGeneralScreen();

export default instance;
