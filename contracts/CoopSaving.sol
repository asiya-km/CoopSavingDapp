// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CoopSaving {
    struct Member {
        bool exists;
        uint256 balance;
        uint256 totalLoan;
    }

    struct LoanRequest {
        address requester;
        uint256 amount;
        uint256 interest;
        uint256 approvedCount;
        bool approved;
        bool disbursed;
        mapping(address => bool) voted;
    }

    mapping(address => Member) public members;
    address[] public memberList;
    uint256 public totalPool;
    uint256 public loanIdCounter;
    mapping(uint256 => LoanRequest) public loanRequests;

    uint256 public constant REQUIRED_APPROVALS = 2;

    event MemberRegistered(address indexed member);
    event Deposit(address indexed member, uint256 amount);
    event Withdraw(address indexed member, uint256 amount);
    event LoanRequested(uint256 indexed loanId, address indexed member, uint256 amount, uint256 interest);
    event LoanApproved(uint256 indexed loanId, address indexed approver);
    event LoanDisbursed(uint256 indexed loanId, address indexed member, uint256 amount);
    event LoanRepaid(uint256 indexed loanId, address indexed member, uint256 amount);

    function register() external {
        require(!members[msg.sender].exists, "Already registered");
        members[msg.sender] = Member(true, 0, 0);
        memberList.push(msg.sender);
        emit MemberRegistered(msg.sender);
    }

    function deposit() external payable {
        require(members[msg.sender].exists, "Not registered");
        require(msg.value > 0, "Must deposit something");
        members[msg.sender].balance += msg.value;
        totalPool += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        require(members[msg.sender].exists, "Not registered");
        require(amount > 0, "Must withdraw something");
        require(members[msg.sender].balance >= amount, "Insufficient balance");
        require(totalPool >= amount, "Insufficient pool balance");
        
        members[msg.sender].balance -= amount;
        totalPool -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdraw(msg.sender, amount);
    }

    function requestLoan(uint256 amount, uint256 interest) external returns (uint256) {
        require(members[msg.sender].exists, "Not registered");
        require(amount > 0, "Loan amount must be positive");
        require(totalPool >= amount, "Insufficient pool funds");
        
        loanIdCounter++;
        LoanRequest storage loan = loanRequests[loanIdCounter];
        loan.requester = msg.sender;
        loan.amount = amount;
        loan.interest = interest;
        loan.approvedCount = 0;
        loan.approved = false;
        loan.disbursed = false;

        emit LoanRequested(loanIdCounter, msg.sender, amount, interest);
        return loanIdCounter;
    }

    function approveLoan(uint256 loanId) external {
        require(members[msg.sender].exists, "Not registered");
        require(loanId > 0 && loanId <= loanIdCounter, "Invalid loan ID");
        
        LoanRequest storage loan = loanRequests[loanId];
        require(!loan.approved, "Loan already approved");
        require(msg.sender != loan.requester, "Cannot approve own loan");
        require(!loan.voted[msg.sender], "Already voted");

        loan.voted[msg.sender] = true;
        loan.approvedCount++;

        emit LoanApproved(loanId, msg.sender);

        if (loan.approvedCount >= REQUIRED_APPROVALS) {
            loan.approved = true;
            _disburseLoan(loanId);
        }
    }

    function _disburseLoan(uint256 loanId) internal {
        LoanRequest storage loan = loanRequests[loanId];
        require(loan.approved && !loan.disbursed, "Loan already disbursed");
        require(totalPool >= loan.amount, "Insufficient pool funds");

        loan.disbursed = true;
        totalPool -= loan.amount;
        
        // Calculate total owed (principal + interest)
        uint256 interestAmount = (loan.amount * loan.interest) / 100;
        uint256 totalOwed = loan.amount + interestAmount;
        members[loan.requester].totalLoan += totalOwed;
        
        // Transfer the loan amount to requester
        payable(loan.requester).transfer(loan.amount);
        
        emit LoanDisbursed(loanId, loan.requester, loan.amount);
    }

    function repayLoan(uint256 loanId) external payable {
        require(members[msg.sender].exists, "Not registered");
        require(loanId > 0 && loanId <= loanIdCounter, "Invalid loan ID");
        require(loanRequests[loanId].disbursed, "Loan not disbursed");
        require(msg.value > 0, "Must send payment");

        uint256 payment = msg.value;
        require(members[msg.sender].totalLoan >= payment, "Payment exceeds loan balance");

        members[msg.sender].totalLoan -= payment;
        totalPool += payment;

        emit LoanRepaid(loanId, msg.sender, payment);
    }

    // VIEW FUNCTIONS
    function getBalance(address user) external view returns (uint256) {
        return members[user].balance;
    }

    function getLoan(address user) external view returns (uint256) {
        return members[user].totalLoan;
    }

    function getMembers() external view returns (address[] memory) {
        return memberList;
    }

    function getTotalPool() external view returns (uint256) {
        return totalPool;
    }

    function isRegistered(address user) external view returns (bool) {
        return members[user].exists;
    }

    function getLoanDetails(uint256 loanId) external view returns (
        address requester,
        uint256 amount,
        uint256 interest,
        uint256 approvedCount,
        bool approved,
        bool disbursed
    ) {
        require(loanId > 0 && loanId <= loanIdCounter, "Invalid loan ID");
        LoanRequest storage loan = loanRequests[loanId];
        return (
            loan.requester,
            loan.amount,
            loan.interest,
            loan.approvedCount,
            loan.approved,
            loan.disbursed
        );
    }

    function hasVoted(uint256 loanId, address voter) external view returns (bool) {
        return loanRequests[loanId].voted[voter];
    }
}