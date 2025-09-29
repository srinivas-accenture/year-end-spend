Campaign Flow: 
==============

===============================================================================
Registration Page:
------------------
1. invoke invoke RTIM for offer 
    -> if campaign expired, 
        -> navigate to the end-campaign page
    -> if not, 
        -> show registartion page 
        -> invoke view impression on registration page load
        -> proceed the below points
2. Update only the campaign end date from RTIM
3. invoke update click impression on register now button click
4. handle unlock cards - instruction popup link
5. navigate to respective page
    -> confirmation page on success of click impression (registartion success)
    -> error page on failure of click impression (registartion failure)
6. handle Terms and condition link
7. navigate to PN on click of close icon

===============================================================================
Instruction Modal Popup:
------------------------
1. On load of the popup, always show the first tab
2. tab toggle functionality
3. on click of close button, close the popup

===============================================================================
Confirmation Page:
------------------
1. navigate to landing page on click of get started button
2. navigate to PN on click of close 

===============================================================================
Landing page: 
--------------
1. invoke RTIM for offer and invoke view impression on landing page load
2. Update the 'packs' count from RTIM response
3. group the cards by group id and store it as 'issuedCardGroups'
4. compare the 'packs' count with 'issuedCardGroups' length
    -> if its equal, will show landing page
    -> if its error, will show error page
5. navigate to card collection page on click of 'View cards & prizes' button
6. handle Terms and condition link
7. navigate to instruction page on click of 'How to play' Link ------------------------------- needs to confirm
8. navigate to PN on click of close icon
9. Show the buttons and add navigation flow based on packs count from RTIM response
    -> zero packs
        -> add 'Unlock more packs' button
        -> navigate to instruction page on click of 'Unlock more packs' button
    -> with some packs 
        -> add 'Play now' button
        -> navigate to game page on click of 'Play now' button
10. check-in button
    -> filter for 'checkin' offer
        -> if offer is there, then daily checin popup will be opened on top the landing page
        -> if not, will close landing page and show error page
11. create the session storage values based on RTIM response(packs, issuedCardGroups, issuedCards, issuedRewards) to use it in the game screen

===============================================================================
Game landing Page:
-------------------
1. read the packs count and issuedCardGroups from session storage
2. on close, to navigate to landing page
    -> invoke this function showLandingPage()
3. on 'Unlock more packs' click, to navigate to instruction page
    -> showInstructionPage('game-screen')
4. on 'View cards & prizes' click, to navigate to card collection page
5. on game play,
  -> invoke the update click impression on successful play
    -> on completion of 'pack load into camera' and 'open all' play
        -> invoke this function (handleClickImpressionOnEvent)
            -> handleClickImpressionOnEvent(eventButton, 'game-play', 'all / one' )
        -> if oneplay, 
          -> will take the first issued cardgroup and assign in currentCardGroup Array in session storage
        -> if 'open all' play, 
          -> will take all issued cardgroup and assign in currentCardGroup Array in session storage
5. navigate to respective page with respective reward details
    -> succussful click impression
        -> general script
          -> one play
            -> set the reduced packs count by 1 in session storage
            -> remove the first card group from issuedCardGroups and store it in currentCardGroup
            -> will invoke the game screen function (invokeRewardPopup)
          -> 'open all' play, 'Yes, proceed' click on open all popup
            -> set the reduced packs count with '0' in session storage
            -> remove the card groups from issuedCardGroups and store it in currentCardGroup
            -> will invoke the game screen function (invokeRewardPopup)
        -> game script
          -> create a function to handle below steps (invokeRewardPopup)
            -> read the currentCardGroup and group it by RewardProvider of the card object
            -> packs <= 5
              -> will show less than 5 paks Reward page 
            -> packs > 5
              -> will show more than 5 paks Reward page 
            -> packs === 0
              -> will show no packs left page
    -> error page on failure of click impression

Game camera Page
----------------
1. on close of game camera screen, where will it go ---------------------------------- needs to confirm
2. on 'Skip to prizes' click, where will it go ---------------------------------- needs to confirm

Game popup screen
----------------
-> packs <= 5
  -> will show less than 5 paks Reward page 
-> packs > 5
  -> will show more than 5 paks Reward page 
-> packs === 0
  -> will show no packs left page


===============================================================================
error page:
-----------
1. the page should be displayed on technical or script failures
2. navigate to PN on click of 'Try again' button
3. navigate to PN on click of 'go back' button 

===============================================================================



===============================================================================

Instruction Page:
-----------------
1. navigate to Landing page on click of back arrow icon
2. Update instructions list based on the isUserActive flag
3. navigate to Landing page on click of 'Back to Home' button
4. handle Terms and condition link

===============================================================================

Reward page (voucher, gift, cashback, reward points, air ticket): 
-----------------------------------------------------------------
1. Update the icon, turns count and reward details from RTIM response and based on the reward won by user
2. show 'View voucher details / View prize details' button based on the reward won by user
    -> navigate to the respective Reward-details page
3. invoke the share functionality on click of the share option
4. Show the buttons and add navigation flow based on turns count from RTIM response
    -> turns > 1
        -> show 'play again' button
            -> invoke RTIM for offer
            -> update the local storage values based on RTIM response
            -> navigate to with-turn-game page on click of the button
        -> show 'use all turns' link
            -> navigate to the Redeption-all confirmation popup on click of the link
5. navigate to with-turn-game page on click of close icon

===============================================================================

Reward-details page (voucher, gift, cashback, reward points, air ticket): 
-------------------------------------------------------------------------
1. Update the reward name, redeem message, expiry date, icon based on the based on reward won by user
2. handle Terms and condition link
3. invoke the share functionality on click of the share option
4. invoke the copy functionality on click of the 'Copy voucher code' button if the reward is voucher
5. navigate to with-turn-game/Reward-result/Prize-listing page on click of close icon

===============================================================================

Redeption-all confirmation popup:
---------------------------------
1. Update the remaining turns count after the play in this popup
2. On click of the 'play all turns now' button
    -> invoke the 'play all turns' functionality
    -> navigate to the Redemption-all loading popup
3. navigate to the with-turn-game page on click of cancel link

===============================================================================

Redeption-all loading popup:
--------------------------------
1. Update the remaining turns count after the play in this popup
2. On completion of the loader
    -> invoke the 'play all turns' functionality
    -> navigate to the Reward-result page

===============================================================================

Card and Reward Collection page:
---------------------------------
1. invoke RTIM for offer and invoke view impression on reward result page load
    -> update the local storage values based on RTIM response
    -> update the page with acquired reward details from RTIM
2. handle Terms and condition link
3. navigate to the Prize-listing page on click of 'view all prizes' button
4. navigate to the landing page on click of 'Back to home' button
5. add navigation to the Reward-details page for the rewards (voucher, gift, ait ticket)

===============================================================================

end-campaign page:
------------------
1. navigate to PN on click of close icon
2. update the expiry date from RTIM response
3. if the user is Registered,
    -> show the Registered end campaign page instead of default page
    -> Update the aggregated value in respective tiles 
4. navigate to the Prize-listing page on click of 'view all prizes' button

===============================================================================




[
  {
    "type": "StatusUpdate",
    "value": "123",
    "key": "RewardGroupID"
  }
]


packs - 3
issuedcard  - 9, 6, 3 (3 res1, 3 travel1, 3 luggage) ->  2r, 2t, 2l, -> 2r, 1t, 1l -> 
issuedRewards - 3 (1 res1, 1 travel1, 1 luggage)

RewardType && RewardProvider from the issued card

acquired res1 - 0 - 1 - 2
acquired res2 - 0
acquired res3 - 0
acquired res4 - 0
acquired travel1 - 0 -1  - 2
acquired travel2 - 0
acquired travel3 - 0
acquired travel4 - 0
acquired luggage - 0 -1 - 2 
acquired bonus - 0
acquired grandprize - 0



Will they send all restaurant/travel acquired card count always or monthly based card count

If res/travel/luggage/bonus card count is 0, shall we show the tile or not

if i am new user, navigating to card collection page, what should be displayed. 
needs to show grand rize tile with 0 value. is it correct 

once the customer collected one type gift, is it possible to get another gift of same type.
if luggage and dine

