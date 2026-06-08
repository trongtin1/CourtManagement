namespace CourtManagementBE.Domain.Constants;

public static class AccountingConstants
{
    public static class JournalEntryStatus
    {
        public const string Draft = "Draft";
        public const string Posted = "Posted";
        public const string Voided = "Voided";
        public const string Reversed = "Reversed";

        public static readonly string[] All = [Draft, Posted, Voided, Reversed];
    }

    public static class ReceivableStatus
    {
        public const string Unpaid = "Unpaid";
        public const string PartiallyPaid = "PartiallyPaid";
        public const string Paid = "Paid";
        public const string Overdue = "Overdue";
        public const string WrittenOff = "WrittenOff";
        public const string Cancelled = "Cancelled";

        public static readonly string[] All = [Unpaid, PartiallyPaid, Paid, Overdue, WrittenOff, Cancelled];
    }

    public static class AccountingRuleOperator
    {
        public const string Equal = "=";
        public const string NotEquals = "!=";
        public const string GreaterThan = ">";
        public const string LessThan = "<";
        public const string GreaterOrEqual = ">=";
        public const string LessOrEqual = "<=";

        public static readonly string[] All = [Equal, NotEquals, GreaterThan, LessThan, GreaterOrEqual, LessOrEqual];
    }

    public static class AccountingRuleLogicalOperator
    {
        public const string And = "AND";
        public const string Or = "OR";

        public static readonly string[] All = [And, Or];
    }
}
