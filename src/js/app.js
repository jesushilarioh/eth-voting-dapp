App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: () => {
    return App.initWeb3()
  },

  initWeb3: () => {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545')
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract()
  },

  initContract: () => {
    $.getJSON("Election.json", election => {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election)
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider)

      return App.render()
    })
  },

  render: () => {
    let electionInstance,
      loader = $("#loader"),
      content = $("#content")

    loader.show()
    content.hide()

    // Load account data
    web3.eth.getCoinbase((err, account) => {
      if (err === null) {
        App.account = account;
        $("#accountAddress")
          .html("Your Account: " + account)
      }
    })

    // Load contract data
    App.contracts.Election.deployed()
      .then(instance => {
        electionInstance = instance
        return electionInstance.candidatesCount()
      })
      .then(candidatesCount => {
        let candidatesResults = $("#candidatesResults")
        candidatesResults.empty()

        let candidatesSelect = $('#candidatesSelect')
        candidatesSelect.empty()

        for (let i = 1; i <= candidatesCount; i++) {
          electionInstance.candidates(i)
            .then(candidate => {
              let id = candidate[0],
                name = candidate[1],
                voteCount = candidate[2];
              
              // Render candidate Result
              let candidateTemplate = 
                "<tr><th>" + id +
                "</th><td>" + name +
                "</td><td>" + voteCount + 
                "</td></tr>"
              candidatesResults.append(candidateTemplate)

              // Render candidate ballot option
            var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
            candidatesSelect.append(candidateOption);
          })
        }

        return electionInstance.voters(App.account)
      })
      .then(hasVoted => {
        if (hasVoted) {
          $('form').hide()
        }
        loader.hide()
        content.show()
      })
      .catch(error => {
        console.warn(error);
      }) 
  },

  castVote: () => {
    const candidateId = $('#candidatesSelect').val()
    App.contracts.Election.deployed()
      .then(instance => {
        return instance.vote(candidateId, { from: App.account })
      })
      .then(result => {
      // Wait for votes to update
        $("#content").hide()
        $("#loader").show()
      })
      .catch(err => {
      console.error(err)
      })
  },

  listenForEvents: () => {
    App.contracts.Election.deployed()
      .then(instance => {
        instance.votedEvent({}, {
          fromBlock: 0,
          toBlock: 'latest'
        })
          .watch((error, event) => {
            console.log("event triggered", event)  
            // Reload when a new vote is recorded
            App.render()
          })
    })
  },

  initContract: () => {
    $.getJSON("Election.json", election => {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election)
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider)

      App.listenForEvents()

      return App.render()
    })
  }
}

$(() => {
  $(window).load(() => {
    App.init()
  }) 
})