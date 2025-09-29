Game landing Page:
-------------------
1. read the packs count and currentCardGroup from session storage

2. on close, to navigate to landing page
    -> invoke this function 
      -> showLandingPage('game-screen')

3. on 'Unlock more packs' click, to navigate to instruction page
    -> invoke this function
      -> showInstructionPage('game-screen')

4. on 'View cards & prizes' click, to navigate to card collection page
    -> invoke this function
      -> showCardCollectionPage('game-screen')
      
5. on game play,
  -> invoke the update click impression on successful play
    -> on completion of 'pack load into camera' and 'open all' play
        -> invoke this function (handleClickImpressionOnEvent)
            -> handleClickImpressionOnEvent(gameContainer, 'game-play', 'all / one' )
              -> const gameContainer = that.gamePlayPage.querySelector('.sc-year-end-spend-polaroid-game__wrapper');
              -> that.handleClickImpressionOnEvent(gameContainer, 'game-play', 'one');

6. navigate to respective page with respective reward details
    -> succussful click impression
        -> general script (will be taken care by us)
          -> one play
            -> set the reduced packs count by 1 in session storage
            -> remove the first card group from issuedCardGroups and store it in currentCardGroup
            -> will invoke the game screen function (invokeRewardPage)
          -> 'open all' play, 'Yes, proceed' click on open all popup
            -> set the reduced packs count with '0' in session storage
            -> remove the card groups from issuedCardGroups and store it in currentCardGroup
            -> will invoke the game screen function (invokeRewardPage)
        -> game script
          -> create a function to handle below steps (invokeRewardPage)
            -> read the currentCardGroup and group it by RewardProvider of the card object
            -> packs <= 5
              -> will show less than 5 paks Reward page 
            -> packs > 5
              -> will show more than 5 paks Reward page 
            -> packs === 0
              -> will show no packs left page
    -> error page on failure of click impression (will be taken care by us)
7. use 'groupCardsByProperty' function to group the cards by property
  