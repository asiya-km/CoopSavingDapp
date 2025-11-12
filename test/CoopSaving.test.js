const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CoopSaving DApp", function () {
  let CoopSaving, coop, owner, member1, member2, member3;

  beforeEach(async function () {
    [owner, member1, member2, member3] = await ethers.getSigners();
    CoopSaving = await ethers.getContractFactory("CoopSaving");
    coop = await CoopSaving.deploy();
    await coop.deployed();
  });

  it("should register members", async function () {
    await coop.connect(member1).register();
    await coop.connect(member2).register();

    const members = await coop.getMembers();
    expect(members.length).to.equal(2);
    expect(members[0]).to.equal(member1.address);
    expect(members[1]).to.equal(member2.address);
  });

  it("should allow deposits and update balance", async function () {
    await coop.connect(member1).register();
    await coop.connect(member1).deposit({ value: ethers.utils.parseEther("1") });
    const balance = await coop.connect(member1).getBalance();
    expect(balance).to.equal(ethers.utils.parseEther("1"));
  });

  it("should allow withdrawals if balance is sufficient", async function () {
    await coop.connect(member1).register();
    await coop.connect(member1).deposit({ value: ethers.utils.parseEther("2") });
    await coop.connect(member1).withdraw(ethers.utils.parseEther("1"));
    const balance = await coop.connect(member1).getBalance();
    expect(balance).to.equal(ethers.utils.parseEther("1"));
  });

  it("should handle loan requests and approvals", async function () {
    await coop.connect(member1).register();
    await coop.connect(member2).register();
    await coop.connect(member3).register();

    await coop.connect(member2).deposit({ value: ethers.utils.parseEther("3") });
    await coop.connect(member3).deposit({ value: ethers.utils.parseEther("3") });

    const tx = await coop.connect(member1).requestLoan(ethers.utils.parseEther("5"), 10);
    const receipt = await tx.wait();
    const loanId = receipt.events[0].args.loanId;

    await coop.connect(member2).approveLoan(loanId);
    await coop.connect(member3).approveLoan(loanId);

    const loan = await coop.loanRequests(loanId);
    const totalLoan = await coop.connect(member1).getLoan();

    expect(loan.approved).to.be.true;
    expect(totalLoan).to.equal(ethers.utils.parseEther("5.5"));
  });

  it("should allow loan repayment", async function () {
    await coop.connect(member1).register();
    await coop.connect(member2).register();
    await coop.connect(member3).register();

    // Member1 deposits for general use (not for repayment)
    await coop.connect(member1).deposit({ value: ethers.utils.parseEther("10") });

    // Other members fund the pool
    await coop.connect(member2).deposit({ value: ethers.utils.parseEther("3") });
    await coop.connect(member3).deposit({ value: ethers.utils.parseEther("3") });

    // Request and approve loan
    const tx = await coop.connect(member1).requestLoan(ethers.utils.parseEther("5"), 10);
    const receipt = await tx.wait();
    const loanId = receipt.events[0].args.loanId;

    await coop.connect(member2).approveLoan(loanId);
    await coop.connect(member3).approveLoan(loanId);

    // Repay loan by sending ETH
    await coop.connect(member1).repayLoan(loanId, ethers.utils.parseEther("5.5"), {
      value: ethers.utils.parseEther("5.5")
    });

    const remainingLoan = await coop.connect(member1).getLoan();
    const remainingBalance = await coop.connect(member1).getBalance();

    expect(remainingLoan).to.equal(0);
    expect(remainingBalance).to.equal(ethers.utils.parseEther("10")); // Original deposit unchanged
  });
});