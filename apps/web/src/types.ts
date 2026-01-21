export type Contact = {
    id: string;
    email: string;
    name: string;
    balance: number ;
    createdAt?: string;
  };
  export type OperationType = "add" | "sub";

  export type Operation = {
    id: string;
    contactId: string;
    amount: number;
    type : OperationType;
    createdAt: string;
    balanceAfter: number; 
  };