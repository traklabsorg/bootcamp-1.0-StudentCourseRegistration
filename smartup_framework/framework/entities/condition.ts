import {ConditionalOperation} from "./conditionOperation";
import {FieldOperaton} from "./fieldOperation";

export class Condition{

    private FieldName!: string;
    private FieldValue:any;
    private IsCaseInSensitiveSearch!:boolean;
    private OperatorSymbol!: FieldOperaton;
    private ConditionalSymbol!: ConditionalOperation;
    private TypeName!: string;

    Condition(filedName:string,fieldValue:any,operatorSymbol:FieldOperaton,conditionalSymbol:ConditionalOperation,isCaseInSensitiveSearch:boolean=false){
        
        this.FieldName = filedName;
        this.FieldValue = fieldValue;
        this.OperatorSymbol = operatorSymbol;
        this.ConditionalSymbol = conditionalSymbol;
        this.IsCaseInSensitiveSearch = isCaseInSensitiveSearch;

    }
}

// public sealed class Condition 
//     {
//         #region ctor
//         /// <summary>
//         /// Initializes a new instance of the <see cref="Condition" /> class.
//         /// </summary>
//         public Condition()
//         { }

//         /// <summary>
//         /// Initializes a new instance of the <see cref="Condition" /> class.
//         /// </summary>
//         /// <param name="fieldName">Name of the field.</param>
//         /// <param name="fieldValue">The field value.</param>
//         public Condition(string fieldName, dynamic fieldValue, bool isCaseInSensitiveSearch=false)
//         {
//             FieldName = fieldName;
//             FieldValue = fieldValue;
//             IsCaseInSensitiveSearch = isCaseInSensitiveSearch;
//         }

//         /// <summary>
//         /// Initializes a new instance of the <see cref="Condition" /> class.
//         /// </summary>
//         /// <param name="fieldName">Name of the field.</param>
//         /// <param name="fieldValue">The field value.</param>
//         /// <param name="operatorSymbol">The operator symbol.</param>
//         public Condition(string fieldName, dynamic fieldValue, FilterOperation operatorSymbol, bool isCaseInSensitiveSearch = false)
//         {
//             FieldName = fieldName;
//             FieldValue = fieldValue;
//             OperatorSymbol = operatorSymbol;
//             ConditionalSymbol = ConditionalOperation.And;
//             IsCaseInSensitiveSearch = isCaseInSensitiveSearch;
//         }

//         /// <summary>
//         /// Initializes a new instance of the <see cref="Condition" /> class.
//         /// </summary>
//         /// <param name="fieldName">Name of the field.</param>
//         /// <param name="fieldValue">The field value.</param>
//         /// <param name="operatorSymbol">The operator symbol.</param>
//         public Condition(string fieldName, dynamic fieldValue, FilterOperation operatorSymbol, ConditionalOperation conditionalSymbol, bool isCaseInSensitiveSearch = false)
//         {
//             FieldName = fieldName;
//             FieldValue = fieldValue;
//             OperatorSymbol = operatorSymbol;
//             ConditionalSymbol = conditionalSymbol;
//             IsCaseInSensitiveSearch = isCaseInSensitiveSearch;
//         }

//         #endregion

//         /// <summary>
//         /// Gets or sets the name of the field.
//         /// </summary>
//         /// <value>The name of the field.</value>
//         public string FieldName { get; set; }

//         /// <summary>
//         /// Gets or sets the field value.
//         /// </summary>
//         /// <value>The field value.</value>
//         public dynamic FieldValue { get; set; }

//         /// <summary>
//         /// Gets or sets the operator symbol.
//         /// </summary>
//         /// <value>The operator symbol.</value>
//         public FilterOperation OperatorSymbol { get; set; }

//         /// <summary>
//         /// Gets or sets the conditional symbol.
//         /// </summary>
//         /// <value>
//         /// The conditional symbol.
//         /// </value>
//         public ConditionalOperation ConditionalSymbol { get; set; }


//         public bool IsCaseInSensitiveSearch { get; set; }

//         /// <summary>
//         /// Gets or sets the type of the field.
//         /// </summary>
//         /// <value>The name of the field.</value>
//         public string TypeName { get; set; }
//     }