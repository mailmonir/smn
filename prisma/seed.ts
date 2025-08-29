import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

// const prisma = new PrismaClient();

async function main() {
  // Create categories
  const categories = [
    { name: "Honesty", description: "Assess truthfulness", order: 1 },
    {
      name: "Trustworthiness",
      description: "Assess dependability",
      order: 2,
    },
    {
      name: "Ethical Decision-Making",
      description: "Assess moral reasoning",
      order: 3,
    },
    {
      name: "Integrity at Work",
      description: "Assess workplace integrity",
      order: 4,
    },
    {
      name: "Responsibility & Fairness",
      description: "Assess accountability",
      order: 5,
    },
  ];

  const createdCategories = await Promise.all(
    categories.map((c) =>
      prisma.category.create({
        data: c,
      })
    )
  );

  const categoryMap: Record<string, string> = {};
  createdCategories.forEach((c) => (categoryMap[c.name] = c.id));

  // Insert questions (with JSON options)
  const questions = [
    {
      category: "Honesty",
      question:
        "If you accidentally receive extra change at a store, what do you do?",
      options: [
        { id: "a", text: "Keep it", isCorrect: false },
        { id: "b", text: "Return it", isCorrect: true },
        { id: "c", text: "Share with a friend", isCorrect: false },
        { id: "d", text: "Hide it", isCorrect: false },
      ],
      marks: 1,
      order: 1,
    },
    {
      category: "Honesty",
      question: "When asked about a mistake at work, what is the right action?",
      options: [
        { id: "a", text: "Deny it", isCorrect: false },
        { id: "b", text: "Blame someone else", isCorrect: false },
        { id: "c", text: "Admit and learn", isCorrect: true },
        { id: "d", text: "Ignore it", isCorrect: false },
      ],
      marks: 1,
      order: 2,
    },
    {
      category: "Honesty",
      question: "If you find a lost wallet, what would you most likely do?",
      options: [
        { id: "a", text: "Keep the money", isCorrect: false },
        { id: "b", text: "Return it to the owner", isCorrect: true },
        { id: "c", text: "Throw it away", isCorrect: false },
        { id: "d", text: "Ignore it", isCorrect: false },
      ],
      marks: 1,
      order: 3,
    },
    {
      category: "Honesty",
      question: "When filling out a form, you should:",
      options: [
        { id: "a", text: "Provide false info", isCorrect: false },
        { id: "b", text: "Leave out details", isCorrect: false },
        { id: "c", text: "Provide accurate info", isCorrect: true },
        { id: "d", text: "Guess randomly", isCorrect: false },
      ],
      marks: 1,
      order: 4,
    },
    {
      category: "Honesty",
      question: "How should you act if a teacher asks if you copied homework?",
      options: [
        { id: "a", text: "Lie", isCorrect: false },
        { id: "b", text: "Admit truthfully", isCorrect: true },
        { id: "c", text: "Blame a friend", isCorrect: false },
        { id: "d", text: "Say nothing", isCorrect: false },
      ],
      marks: 1,
      order: 5,
    },
    {
      category: "Honesty",
      question: "Which is an example of dishonesty?",
      options: [
        { id: "a", text: "Lying", isCorrect: true },
        { id: "b", text: "Telling the truth", isCorrect: false },
        { id: "c", text: "Being polite", isCorrect: false },
        { id: "d", text: "Helping others", isCorrect: false },
      ],
      marks: 1,
      order: 6,
    },
    {
      category: "Honesty",
      question: "What builds trust the most?",
      options: [
        { id: "a", text: "Always telling the truth", isCorrect: true },
        { id: "b", text: "Avoiding conversations", isCorrect: false },
        { id: "c", text: "Breaking promises", isCorrect: false },
        { id: "d", text: "Keeping secrets unnecessarily", isCorrect: false },
      ],
      marks: 1,
      order: 7,
    },
    {
      category: "Honesty",
      question:
        "If you break something at a friend's house, what should you do?",
      options: [
        { id: "a", text: "Hide it", isCorrect: false },
        { id: "b", text: "Blame others", isCorrect: false },
        { id: "c", text: "Admit and offer to replace", isCorrect: true },
        { id: "d", text: "Leave quickly", isCorrect: false },
      ],
      marks: 1,
      order: 8,
    },
    {
      category: "Honesty",
      question: "What is the foundation of honesty?",
      options: [
        { id: "a", text: "Deception", isCorrect: false },
        { id: "b", text: "Truthfulness", isCorrect: true },
        { id: "c", text: "Excuses", isCorrect: false },
        { id: "d", text: "Silence", isCorrect: false },
      ],
      marks: 1,
      order: 9,
    },
    {
      category: "Honesty",
      question: "If your boss asks for honest feedback, what should you do?",
      options: [
        { id: "a", text: "Say only positive things", isCorrect: false },
        { id: "b", text: "Provide constructive truth", isCorrect: true },
        { id: "c", text: "Lie to make them happy", isCorrect: false },
        { id: "d", text: "Stay quiet", isCorrect: false },
      ],
      marks: 1,
      order: 10,
    },
    {
      category: "Trustworthiness",
      question: "What makes a person trustworthy?",
      options: [
        { id: "a", text: "Breaking promises", isCorrect: false },
        { id: "b", text: "Keeping commitments", isCorrect: true },
        { id: "c", text: "Lying when needed", isCorrect: false },
        { id: "d", text: "Ignoring others’ needs", isCorrect: false },
      ],
      marks: 1,
      order: 1,
    },
    {
      category: "Trustworthiness",
      question: "If you promise to help a friend move, what should you do?",
      options: [
        { id: "a", text: "Forget about it", isCorrect: false },
        { id: "b", text: "Show up and help", isCorrect: true },
        { id: "c", text: "Make excuses", isCorrect: false },
        { id: "d", text: "Wait until asked again", isCorrect: false },
      ],
      marks: 1,
      order: 2,
    },
    {
      category: "Trustworthiness",
      question: "Which action destroys trust the fastest?",
      options: [
        { id: "a", text: "Being reliable", isCorrect: false },
        { id: "b", text: "Lying repeatedly", isCorrect: true },
        { id: "c", text: "Arriving on time", isCorrect: false },
        { id: "d", text: "Being respectful", isCorrect: false },
      ],
      marks: 1,
      order: 3,
    },
    {
      category: "Trustworthiness",
      question: "If your coworker lends you money, how should you act?",
      options: [
        { id: "a", text: "Avoid paying them back", isCorrect: false },
        { id: "b", text: "Return it on time", isCorrect: true },
        { id: "c", text: "Pretend you forgot", isCorrect: false },
        { id: "d", text: "Wait until they demand", isCorrect: false },
      ],
      marks: 1,
      order: 4,
    },
    {
      category: "Trustworthiness",
      question: "How can a leader earn trust?",
      options: [
        { id: "a", text: "Being unfair", isCorrect: false },
        { id: "b", text: "Being consistent", isCorrect: true },
        { id: "c", text: "Breaking rules", isCorrect: false },
        { id: "d", text: "Ignoring feedback", isCorrect: false },
      ],
      marks: 1,
      order: 5,
    },
    {
      category: "Trustworthiness",
      question: "What does it mean to be dependable?",
      options: [
        { id: "a", text: "People cannot count on you", isCorrect: false },
        { id: "b", text: "People can rely on you", isCorrect: true },
        { id: "c", text: "You only help sometimes", isCorrect: false },
        { id: "d", text: "You change promises often", isCorrect: false },
      ],
      marks: 1,
      order: 6,
    },
    {
      category: "Trustworthiness",
      question: "If you can’t finish a task on time, what should you do?",
      options: [
        { id: "a", text: "Hide and ignore messages", isCorrect: false },
        { id: "b", text: "Inform others honestly", isCorrect: true },
        { id: "c", text: "Blame someone else", isCorrect: false },
        { id: "d", text: "Pretend it’s finished", isCorrect: false },
      ],
      marks: 1,
      order: 7,
    },
    {
      category: "Trustworthiness",
      question: "What builds trust over time?",
      options: [
        { id: "a", text: "Repeated dishonesty", isCorrect: false },
        {
          id: "b",
          text: "Keeping your word consistently",
          isCorrect: true,
        },
        { id: "c", text: "Making empty promises", isCorrect: false },
        { id: "d", text: "Avoiding responsibility", isCorrect: false },
      ],
      marks: 1,
      order: 8,
    },
    {
      category: "Trustworthiness",
      question: "If a friend shares a secret, what should you do?",
      options: [
        { id: "a", text: "Tell others", isCorrect: false },
        { id: "b", text: "Keep it safe", isCorrect: true },
        { id: "c", text: "Laugh about it", isCorrect: false },
        { id: "d", text: "Post online", isCorrect: false },
      ],
    },
    {
      category: "Trustworthiness",
      question: "When given a responsibility, how should you handle it?",
      options: [
        { id: "a", text: "Forget it", isCorrect: false },
        { id: "b", text: "Do it reliably", isCorrect: true },
        { id: "c", text: "Pass it on secretly", isCorrect: false },
        { id: "d", text: "Delay without reason", isCorrect: false },
      ],
    },
    {
      category: "Ethical Decision-Making",
      question:
        "What should you do if you find a wallet full of cash on the street?",
      options: [
        { id: "a", text: "Keep it for yourself", isCorrect: false },
        { id: "b", text: "Leave it and walk away", isCorrect: false },
        {
          id: "c",
          text: "Return it to its rightful owner or the police",
          isCorrect: true,
        },
        {
          id: "d",
          text: "Take the cash and throw away the wallet",
          isCorrect: false,
        },
      ],
      marks: 1,
      order: 1,
    },
    {
      category: "Ethical Decision-Making",
      question:
        "If you witness cheating in an exam, what is the ethical choice?",
      options: [
        {
          id: "a",
          text: "Join in to avoid being left behind",
          isCorrect: false,
        },
        { id: "b", text: "Ignore it completely", isCorrect: false },
        {
          id: "c",
          text: "Report it to the teacher or authority",
          isCorrect: true,
        },
        {
          id: "d",
          text: "Only tell your close friends",
          isCorrect: false,
        },
      ],
      marks: 1,
      order: 2,
    },
    {
      category: "Ethical Decision-Making",
      question: "When making a difficult decision, what should guide you?",
      options: [
        { id: "a", text: "What benefits you most", isCorrect: false },
        {
          id: "b",
          text: "What causes the least harm and is fair",
          isCorrect: true,
        },
        {
          id: "c",
          text: "What others expect you to do",
          isCorrect: false,
        },
        {
          id: "d",
          text: "What is easiest to achieve",
          isCorrect: false,
        },
      ],
      marks: 1,
      order: 3,
    },
    {
      category: "Ethical Decision-Making",
      question:
        "If your boss asks you to lie to a client, what is the ethical response?",
      options: [
        { id: "a", text: "Lie to protect your job", isCorrect: false },
        {
          id: "b",
          text: "Refuse and explain why honesty matters",
          isCorrect: true,
        },
        {
          id: "c",
          text: "Avoid answering the client",
          isCorrect: false,
        },
        {
          id: "d",
          text: "Change the topic to avoid lying",
          isCorrect: false,
        },
      ],
      marks: 1,
      order: 4,
    },
    {
      category: "Ethical Decision-Making",
      question: "What is the main purpose of ethical decision-making?",
      options: [
        {
          id: "a",
          text: "To maximize personal gain",
          isCorrect: false,
        },
        {
          id: "b",
          text: "To ensure fairness and integrity",
          isCorrect: true,
        },
        { id: "c", text: "To follow rules blindly", isCorrect: false },
        { id: "d", text: "To avoid punishment", isCorrect: false },
      ],
      marks: 1,
      order: 5,
    },
    {
      category: "Ethical Decision-Making",
      question:
        "If your friend wants to copy your homework, what is the ethical choice?",
      options: [
        {
          id: "a",
          text: "Let them copy to avoid conflict",
          isCorrect: false,
        },
        {
          id: "b",
          text: "Refuse and encourage them to try themselves",
          isCorrect: true,
        },
        {
          id: "c",
          text: "Agree but tell them not to copy everything",
          isCorrect: false,
        },
        {
          id: "d",
          text: "Give them only part of the homework",
          isCorrect: false,
        },
      ],
      marks: 1,
      order: 6,
    },
    {
      category: "Ethical Decision-Making",
      question: "What is the ethical way to treat confidential information?",
      options: [
        {
          id: "a",
          text: "Share it with trusted friends",
          isCorrect: false,
        },
        {
          id: "b",
          text: "Use it for personal advantage",
          isCorrect: false,
        },
        {
          id: "c",
          text: "Keep it private and secure",
          isCorrect: true,
        },
        {
          id: "d",
          text: "Post it anonymously online",
          isCorrect: false,
        },
      ],
      marks: 1,
      order: 7,
    },
    {
      category: "Ethical Decision-Making",
      question:
        "What is the ethical choice if a mistake you made harms others?",
      options: [
        {
          id: "a",
          text: "Hide the mistake and hope no one notices",
          isCorrect: false,
        },
        { id: "b", text: "Blame someone else", isCorrect: false },
        {
          id: "c",
          text: "Admit it and try to fix the harm",
          isCorrect: true,
        },
        {
          id: "d",
          text: "Ignore it since it’s already done",
          isCorrect: false,
        },
      ],
      marks: 1,
      order: 8,
    },
    {
      category: "Ethical Decision-Making",
      question: "What role does empathy play in ethical decisions?",
      options: [
        {
          id: "a",
          text: "It makes decisions weaker",
          isCorrect: false,
        },
        {
          id: "b",
          text: "It helps understand and respect others",
          isCorrect: true,
        },
        { id: "c", text: "It causes confusion", isCorrect: false },
        {
          id: "d",
          text: "It prevents logical thinking",
          isCorrect: false,
        },
      ],
      marks: 1,
      order: 9,
    },
    {
      category: "Ethical Decision-Making",
      question: "What should you do if following the rules causes harm?",
      options: [
        { id: "a", text: "Follow the rules anyway", isCorrect: false },
        { id: "b", text: "Break the rules secretly", isCorrect: false },
        {
          id: "c",
          text: "Seek alternatives that reduce harm while respecting values",
          isCorrect: true,
        },
        { id: "d", text: "Ignore the situation", isCorrect: false },
      ],
      marks: 1,
      order: 10,
    },

    {
      category: "Integrity at Work",
      question: "If you make a mistake at work, what is the best action?",
      options: [
        {
          id: "a",
          text: "Hide it and hope nobody notices",
          isCorrect: false,
        },
        {
          id: "b",
          text: "Admit it and take responsibility",
          isCorrect: true,
        },
        { id: "c", text: "Blame a coworker", isCorrect: false },
        { id: "d", text: "Wait until someone asks", isCorrect: false },
      ],
      marks: 1,
      order: 1,
    },
    {
      category: "Integrity at Work",
      question: "What shows integrity at work?",
      options: [
        {
          id: "a",
          text: "Doing the right thing even when no one is watching",
          isCorrect: true,
        },
        {
          id: "b",
          text: "Doing only what benefits you",
          isCorrect: false,
        },
        {
          id: "c",
          text: "Changing your values depending on the situation",
          isCorrect: false,
        },
        {
          id: "d",
          text: "Following rules only when convenient",
          isCorrect: false,
        },
      ],
      marks: 1,
      order: 2,
    },
    {
      category: "Integrity at Work",
      question:
        "If you see a coworker stealing office supplies, what is the right action?",
      options: [
        {
          id: "a",
          text: "Ignore it since it’s not your problem",
          isCorrect: false,
        },
        { id: "b", text: "Join them quietly", isCorrect: false },
        {
          id: "c",
          text: "Report it through proper channels",
          isCorrect: true,
        },
        {
          id: "d",
          text: "Tell everyone in the office gossip",
          isCorrect: false,
        },
      ],
      marks: 1,
      order: 3,
    },
    {
      category: "Integrity at Work",
      question: "How can you build a reputation for integrity at work?",
      options: [
        {
          id: "a",
          text: "Delivering on promises consistently",
          isCorrect: true,
        },
        {
          id: "b",
          text: "Keeping secrets to yourself",
          isCorrect: false,
        },
        { id: "c", text: "Avoiding responsibility", isCorrect: false },
        {
          id: "d",
          text: "Always agreeing with the boss",
          isCorrect: false,
        },
      ],
      marks: 1,
      order: 4,
    },
    {
      category: "Integrity at Work",
      question:
        "What should you do if you accidentally receive confidential information?",
      options: [
        { id: "a", text: "Share it with coworkers", isCorrect: false },
        {
          id: "b",
          text: "Post it online anonymously",
          isCorrect: false,
        },
        {
          id: "c",
          text: "Keep it secure and inform the proper authority",
          isCorrect: true,
        },
        {
          id: "d",
          text: "Ignore and delete it without telling anyone",
          isCorrect: false,
        },
      ],
      marks: 1,
      order: 5,
    },
    {
      category: "Integrity at Work",
      question:
        "If your manager is not present, how should you approach your duties?",
      options: [
        {
          id: "a",
          text: "Work only if someone is watching",
          isCorrect: false,
        },
        { id: "b", text: "Do less work to relax", isCorrect: false },
        {
          id: "c",
          text: "Continue working responsibly",
          isCorrect: true,
        },
        { id: "d", text: "Leave tasks unfinished", isCorrect: false },
      ],
      marks: 1,
      order: 6,
    },
    {
      category: "Integrity at Work",
      question: "How does integrity affect teamwork?",
      options: [
        {
          id: "a",
          text: "It builds trust among coworkers",
          isCorrect: true,
        },
        { id: "b", text: "It slows down progress", isCorrect: false },
        { id: "c", text: "It creates conflicts", isCorrect: false },
        { id: "d", text: "It makes work boring", isCorrect: false },
      ],
      marks: 1,
      order: 7,
    },
    {
      category: "Integrity at Work",
      question:
        "What is the ethical action if you are offered a bribe at work?",
      options: [
        { id: "a", text: "Accept it secretly", isCorrect: false },
        { id: "b", text: "Refuse and report it", isCorrect: true },
        { id: "c", text: "Negotiate for more money", isCorrect: false },
        {
          id: "d",
          text: "Accept but don’t tell anyone",
          isCorrect: false,
        },
      ],
      marks: 1,
      order: 8,
    },
    {
      category: "Integrity at Work",
      question: "What shows a lack of integrity at work?",
      options: [
        { id: "a", text: "Honest communication", isCorrect: false },
        {
          id: "b",
          text: "Taking credit for others’ work",
          isCorrect: true,
        },
        { id: "c", text: "Admitting mistakes", isCorrect: false },
        { id: "d", text: "Being transparent", isCorrect: false },
      ],
      marks: 1,
      order: 9,
    },
    {
      category: "Integrity at Work",
      question: "Why is integrity important in the workplace?",
      options: [
        {
          id: "a",
          text: "It helps build trust and long-term success",
          isCorrect: true,
        },
        { id: "b", text: "It makes you popular", isCorrect: false },
        { id: "c", text: "It guarantees promotions", isCorrect: false },
        { id: "d", text: "It avoids hard work", isCorrect: false },
      ],
      marks: 1,
      order: 10,
    },

    {
      category: "Responsibility & Fairness",
      question: "What does being responsible at work mean?",
      options: [
        {
          id: "a",
          text: "Completing tasks on time and owning results",
          isCorrect: true,
        },
        {
          id: "b",
          text: "Blaming others for delays",
          isCorrect: false,
        },
        {
          id: "c",
          text: "Doing tasks only when convenient",
          isCorrect: false,
        },
        { id: "d", text: "Leaving tasks unfinished", isCorrect: false },
      ],
      marks: 1,
      order: 1,
    },
    {
      category: "Responsibility & Fairness",
      question: "How can fairness be shown in decision-making?",
      options: [
        {
          id: "a",
          text: "By giving everyone an equal opportunity",
          isCorrect: true,
        },
        { id: "b", text: "Favoring close friends", isCorrect: false },
        {
          id: "c",
          text: "Ignoring minority opinions",
          isCorrect: false,
        },
        {
          id: "d",
          text: "Choosing the quickest option always",
          isCorrect: false,
        },
      ],
      marks: 1,
      order: 2,
    },
    {
      category: "Responsibility & Fairness",
      question: "If you promised to complete a task, what should you do?",
      options: [
        {
          id: "a",
          text: "Do your best to complete it on time",
          isCorrect: true,
        },
        {
          id: "b",
          text: "Forget about it if nobody reminds you",
          isCorrect: false,
        },
        {
          id: "c",
          text: "Ask someone else to do it secretly",
          isCorrect: false,
        },
        {
          id: "d",
          text: "Make excuses when it’s late",
          isCorrect: false,
        },
      ],
      marks: 1,
      order: 3,
    },
    {
      category: "Responsibility & Fairness",
      question: "How should a responsible person handle deadlines?",
      options: [
        { id: "a", text: "Plan ahead and meet them", isCorrect: true },
        { id: "b", text: "Work only when pressured", isCorrect: false },
        {
          id: "c",
          text: "Blame lack of time always",
          isCorrect: false,
        },
        {
          id: "d",
          text: "Do tasks at the last minute",
          isCorrect: false,
        },
      ],
      marks: 1,
      order: 4,
    },
    {
      category: "Responsibility & Fairness",
      question: "Which action shows fairness?",
      options: [
        {
          id: "a",
          text: "Treating all team members equally",
          isCorrect: true,
        },
        {
          id: "b",
          text: "Favoring your best friend",
          isCorrect: false,
        },
        {
          id: "c",
          text: "Giving credit only to seniors",
          isCorrect: false,
        },
        {
          id: "d",
          text: "Ignoring certain group members",
          isCorrect: false,
        },
      ],
      marks: 1,
      order: 5,
    },
    {
      category: "Responsibility & Fairness",
      question:
        "If someone disagrees with you in a meeting, how should you respond?",
      options: [
        {
          id: "a",
          text: "Listen respectfully and consider their view",
          isCorrect: true,
        },
        {
          id: "b",
          text: "Ignore their point completely",
          isCorrect: false,
        },
        {
          id: "c",
          text: "Interrupt and dismiss them",
          isCorrect: false,
        },
        { id: "d", text: "Embarrass them publicly", isCorrect: false },
      ],
      marks: 1,
      order: 6,
    },
    {
      category: "Responsibility & Fairness",
      question: "What does accountability mean?",
      options: [
        {
          id: "a",
          text: "Accepting responsibility for your actions",
          isCorrect: true,
        },
        { id: "b", text: "Shifting blame to others", isCorrect: false },
        { id: "c", text: "Avoiding responsibility", isCorrect: false },
        {
          id: "d",
          text: "Ignoring the outcome of your work",
          isCorrect: false,
        },
      ],
      marks: 1,
      order: 7,
    },
    {
      category: "Responsibility & Fairness",
      question: "How do you show fairness in teamwork?",
      options: [
        {
          id: "a",
          text: "Give equal credit to contributors",
          isCorrect: true,
        },
        { id: "b", text: "Credit only the leader", isCorrect: false },
        {
          id: "c",
          text: "Take all the credit yourself",
          isCorrect: false,
        },
        {
          id: "d",
          text: "Praise only your close friends",
          isCorrect: false,
        },
      ],
      marks: 1,
      order: 8,
    },
    {
      category: "Responsibility & Fairness",
      question: "What is a fair approach when resolving conflict?",
      options: [
        {
          id: "a",
          text: "Listen to both sides before deciding",
          isCorrect: true,
        },
        {
          id: "b",
          text: "Support only your friend’s side",
          isCorrect: false,
        },
        {
          id: "c",
          text: "Decide without hearing anyone",
          isCorrect: false,
        },
        { id: "d", text: "Blame the weaker person", isCorrect: false },
      ],
      marks: 1,
      order: 9,
    },
    {
      category: "Responsibility & Fairness",
      question: "Why is fairness important in leadership?",
      options: [
        {
          id: "a",
          text: "It builds trust and respect among the team",
          isCorrect: true,
        },
        { id: "b", text: "It makes you look strict", isCorrect: false },
        { id: "c", text: "It allows favoritism", isCorrect: false },
        { id: "d", text: "It reduces transparency", isCorrect: false },
      ],
      marks: 1,
      order: 10,
    },
  ];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    await prisma.question.create({
      data: {
        categoryId: categoryMap[q.category],
        question: q.question,
        options: q.options, // Prisma will store as JSON
        marks: q.marks,
        order: q.order,
      },
    });
  }

  console.log("✅ Seed completed");
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
