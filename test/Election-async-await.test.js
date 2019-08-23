const Election = artifacts.require('./Election.sol')

contract("Election", (accounts) => {
  let electionInstance

  beforeEach(async () => {
    electionInstance = await Election.new()
  })

  describe('Candidates', async () => {
    let candidateCount,
      candidate1,
      candidate2,
      invalidCandidate
    
    beforeEach(async () => {
      candidateCount = await electionInstance.candidatesCount()
      candidate1 = await electionInstance.candidates(1)
      candidate2 = await electionInstance.candidates(2)
      invalidCandidate = await electionInstance.candidates(99)
    })

    it("initializes with two candidates", async () => {
      assert.equal(candidateCount.toNumber(), 2)
    })

    describe("candidate 1", async () => {
      it('contians correct id', () => {
        assert.equal(candidate1[0], 1)
      })
      it('contains correct name', () => {
        assert.equal(candidate1[1], "Candidate 1")
      })
      it('contains correct vote count', () => {
        assert.equal(candidate1[2], 0)
      })
    }) 

    describe("candidate 2", async () => {
      it('contains correct id', () => {
        assert.equal(candidate2.id, 2)
      })
      it('contains correct name', () => {
        assert.equal(candidate2.name, "Candidate 2")
      })
      it('contains correct vote count', () => {
        assert.equal(candidate2.voteCount, 0)
      })
    })

    describe("candidate invalid 99", async () => {
      it('contains correct id', () => {
        assert.equal(invalidCandidate[0], 0)
      })
      it('contains correct name', () => {
        assert.equal(invalidCandidate[1], '')
      })
      it('contains correct vote count', () => {
        assert.equal(invalidCandidate[2], 0)
      })
    })
  })  

  describe('Voting', () => {
    let voted,
      receipt,
      candidate

    beforeEach(async () => {
      const candidateId = 1
      receipt = electionInstance.vote(candidateId, { from: accounts[0] })
      voted = await electionInstance.voters(accounts[0])
      candidate = await electionInstance.candidates(candidateId)
    })

    describe("allows a voter to cast a vote", () => {
      it("the voter was marked as voted", () => {
        assert(voted)
      })
      it("vote receipt valid", () => {
        assert(receipt)
      })
      it("increments the candidate's vote count", () => {
        let voteCount = candidate.voteCount // or candidate[2]
        assert.equal(voteCount, 1)
      })
    })
  })

  describe('throws an exception for invalid candidates', () => {
    let voteCount
    let candidateId = 99

    it("error message must contain revert", async () => {
      try {
        await electionInstance.vote(candidateId, { from: accounts[1] })
        assert(error.message.indexOf('revert') >= 0, "error message must contain revert")
      } catch (error) {
        assert(error.message.indexOf('revert') >= 0, "error message must contain revert")
      }
    })

    it("candidate 1 did not receive any votes", async () => {
      const candidate1 = await electionInstance.candidates(1)
      voteCount = candidate1[2]
      assert.equal(voteCount.toNumber(), 0)
    })

    it("candidate 2 did not receive any votes", async () => {
      const candidate2 = await electionInstance.candidates(2)
      voteCount = candidate2[2]
      assert.equal(voteCount.toNumber(), 0)
    })
  })

  // it("throws an exception for invalid candidates", () => {
  //   return Election.deployed()
  //     .then(instance => {
  //       electionInstance = instance
  //       return electionInstance.vote(99, { from: accounts[1] })
  //     })
  //     .then(assert.fail)
  //     .catch(error => {
  //       assert(error.message.indexOf('revert') >= 0, "error message must contain revert")
  //       return electionInstance.candidates(1)
  //     })
  //     .then(candidate1 => {
  //       let voteCount = candidate1[2]
  //       assert.equal(voteCount, 1, "candidate 1 did not receive any votes")
  //       return electionInstance.candidates(2)
  //     })
  //     .then(candidate2 => {
  //       let voteCount = candidate2[2]
  //       assert.equal(voteCount, 0, "candidate 2 did not receive any votes")
  //   })
  // })

  // it("throws an exception for double voting", () => {
  //   return Election.deployed()
  //     .then(instance => {
  //       electionInstance = instance
  //       candidateId = 2
  //       electionInstance.vote(candidateId, { from: accounts[1] })
  //       return electionInstance.candidates(candidateId)
  //     })
  //     .then(candidate => {
      
  //   })
  // })
})