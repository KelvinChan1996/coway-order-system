// Agent 列表 - 后续手动增加
let agentList = [
    { id: 1, name: "Ali Rehman", position: "HP", hp_code: "ALI01", contact: "60123456789", receipt: 0, email: "ali@coway.com" },
    { id: 2, name: "Siti Nuraini", position: "SM", hp_code: "SITI02", contact: "60129876543", receipt: 0, email: "siti@coway.com" },
    { id: 3, name: "Chong Wei", position: "HP", hp_code: "CHONG03", contact: "60115551234", receipt: 1, email: "chong@coway.com" }
];

function getLeastBusyAgent() {
    let minReceipt = Math.min(...agentList.map(a => a.receipt));
    return agentList.find(a => a.receipt === minReceipt);
}

function incrementAgentReceipt(agent) {
    if (agent) {
        agent.receipt++;
        console.log(`Agent ${agent.name} now has ${agent.receipt} orders`);
    }
}