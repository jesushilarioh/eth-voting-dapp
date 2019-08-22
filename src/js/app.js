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
          })
        }

        loader.hide()
        content.show()
      })
      .catch(error => {
        console.warn(error);
      }) 
  }
}

$(() => {
  $(window).load(() => {
    App.init()
  }) 
})