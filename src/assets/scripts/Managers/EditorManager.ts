import * as monaco from "monaco-editor";

export default class EditorManager {
  static editor: monaco.editor.IStandaloneCodeEditor | null = null;
  static editorProposals: any[] = [];
  static dynamicEditorProposals: any[] = [];

  private static exploitEditor = document.querySelector(
    ".exploit .main .container .editor"
  ) as HTMLElement;

  static getDependencyProposals(): any {
    return [...this.editorProposals, ...this.dynamicEditorProposals];
  }

  static updateIntelliSense() {
    if (this.editor == null) return;
    this.dynamicEditorProposals = [];
    const editorContent = this.editor.getValue();

    let functionMatch;
    let variableMatch;

    const functionRegex = /(?:\blocal\s+)?function\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
    const variableRegex = /(?:\blocal\s+)([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g;

    while ((functionMatch = functionRegex.exec(editorContent)) !== null) {
      this.dynamicEditorProposals.push({
        label: functionMatch[1],
        kind: monaco.languages.CompletionItemKind.Function,
        detail: "Function",
        insertText: functionMatch[1],
      });
    }

    while ((variableMatch = variableRegex.exec(editorContent)) !== null) {
      this.dynamicEditorProposals.push({
        label: variableMatch[1],
        kind: monaco.languages.CompletionItemKind.Variable,
        detail: "Variable",
        insertText: variableMatch[1],
      });
    }
  }

  static editorAddIntellisense(l: any, k: any, d: any, i: any) {
    let t;

    switch (k) {
      case "Class":
        t = monaco.languages.CompletionItemKind.Class;
        break;
      case "Color":
        t = monaco.languages.CompletionItemKind.Color;
        break;
      case "Constructor":
        t = monaco.languages.CompletionItemKind.Constructor;
        break;
      case "Enum":
        t = monaco.languages.CompletionItemKind.Enum;
        break;
      case "Field":
        t = monaco.languages.CompletionItemKind.Field;
        break;
      case "File":
        t = monaco.languages.CompletionItemKind.File;
        break;
      case "Folder":
        t = monaco.languages.CompletionItemKind.Folder;
        break;
      case "Function":
        t = monaco.languages.CompletionItemKind.Function;
        break;
      case "Interface":
        t = monaco.languages.CompletionItemKind.Interface;
        break;
      case "Keyword":
        t = monaco.languages.CompletionItemKind.Keyword;
        break;
      case "Method":
        t = monaco.languages.CompletionItemKind.Method;
        break;
      case "Module":
        t = monaco.languages.CompletionItemKind.Module;
        break;
      case "Property":
        t = monaco.languages.CompletionItemKind.Property;
        break;
      case "Reference":
        t = monaco.languages.CompletionItemKind.Reference;
        break;
      case "Snippet":
        t = monaco.languages.CompletionItemKind.Snippet;
        break;
      case "Text":
        t = monaco.languages.CompletionItemKind.Text;
        break;
      case "Unit":
        t = monaco.languages.CompletionItemKind.Unit;
        break;
      case "Value":
        t = monaco.languages.CompletionItemKind.Value;
        break;
      case "Variable":
        t = monaco.languages.CompletionItemKind.Variable;
        break;
    }

    this.editorProposals.push({
      label: l,
      kind: t,
      detail: d,
      insertText: i
    });
  }

  static setupEditor() {
    if (this.editor !== null) return;

    monaco.languages.registerCompletionItemProvider("lua", {
      provideCompletionItems: function() {
        return {
          suggestions: EditorManager.getDependencyProposals()
        }
      }
    });

    monaco.editor.defineTheme("dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "global", foreground: "84d6f7", fontStyle: "bold" },
        { token: "keyword", foreground: "f86d7c", fontStyle: "bold" },
        { token: "comment", foreground: "388234" },
        { token: "number", foreground: "ffc600" },
        { token: "string", foreground: "adf195" },
      ],
      colors: {
        "editor.background": "#191c29",
        "editor.foreground": "#c6cff3",
        "list.hoverBackground": "#2f354e",
        "editor.selectionBackground": "#282d42",
        "editorSuggestWidget.background": "#282d42",
        "editorSuggestWidget.selectedBackground": "#2f354e",
        "editorSuggestWidget.highlightForeground": "#c6cff3",
        "editorSuggestWidget.border": "#2f354e",
        "editorOverviewRuler.border": "#2f354e",
        "editor.lineHighlightBackground": "#1d2130",
        "editorCursor.foreground": "#c6cff3",
        "editor.selectionHighlightBorder": "#282d42",
        "editorGutter.background": "#171a26",
      },
    });

    let globalWords = [];
    let keyWords = [];

    for (const key of [
      "_G",
      "_VERSION",
      "Enum",
      "game",
      "plugin",
      "shared",
      "script",
      "workspace",
      "DebuggerManager",
      "elapsedTime",
      "LoadLibrary",
      "PluginManager",
      "settings",
      "tick",
      "time",
      "typeof",
      "UserSettings",
    ]) {
      this.editorAddIntellisense(key, "Variable", key, key);
      globalWords.push(key)
    }

    for (const key of [
      "and",
      "break",
      "do",
      "else",
      "elseif",
      "end",
      "false",
      "for",
      "function",
      "if",
      "in",
      "local",
      "nil",
      "not",
      "or",
      "repeat",
      "return",
      "then",
      "true",
      "until",
      "while",
      "continue"
    ]) {
      this.editorAddIntellisense(key, "Keyword", key, key);
      keyWords.push(key);
    }

    for (const key of [
      "math.abs",
      "math.acos",
      "math.asin",
      "math.atan",
      "math.atan2",
      "math.ceil",
      "math.cos",
      "math.cosh",
      "math.deg",
      "math.exp",
      "math.floor",
      "math.fmod",
      "math.frexp",
      "math.huge",
      "math.ldexp",
      "math.log",
      "math.max",
      "math.min",
      "math.modf",
      "math.pi",
      "math.pow",
      "math.rad",
      "math.random",
      "math.randomseed",
      "math.sin",
      "math.sinh",
      "math.sqrt",
      "math.tan",
      "math.tanh",
      "table.concat",
      "table.foreach",
      "table.foreachi",
      "table.sort",
      "table.insert",
      "table.remove",
      "Color3.new",
      "Instance.new",
      "BrickColor.new",
      "Vector3.new",
      "Vector2.new",
      "debug.gethook",
      "debug.getinfo",
      "debug.getlocal",
      "debug.getmetatable",
      "debug.getregistry",
      "debug.getupvalue",
      "debug.getuservalue",
      "debug.sethook",
      "debug.setlocal",
      "debug.setmetatable",
      "debug.setupvalue",
      "debug.setuservalue",
      "debug.traceback",
      "debug.upvalueid",
      "debug.upvaluejoin",
      "string.byte",
      "string.char",
      "string.dump",
      "string.find",
      "string.format",
      "string.gmatch",
      "string.gsub",
      "string.len",
      "string.lower",
      "string.match",
      "string.rep",
      "string.reverse",
      "string.sub",
      "string.upper",
      "coroutine.create",
      "coroutine.resume",
      "coroutine.running",
      "coroutine.status",
      "coroutine.wrap",
      "coroutine.yield",
      "hookmetamethod",
      "hookfunction",
      "getupvalues",
      "getconstants",
      "getsenv",
    ]) {
      this.editorAddIntellisense(key, "Method", key, key);
    }

    for (const key of [
      "Drawing",
      "debug",
      "Instance",
      "Color3",
      "Vector3",
      "Vector2",
      "BrickColor",
      "math",
      "table",
      "string",
      "coroutine",
      "Humanoid",
      "ClickDetector",
      "LocalScript",
      "Model",
      "ModuleScript",
      "Mouse",
      "Part",
      "Player",
      "Script",
      "Tool",
      "RunService",
      "UserInputService",
      "Workspace",
    ]) {
      this.editorAddIntellisense(key, "Class", key, key);
    }

    for (const key of [
      "print",
      "warn",
      "wait",
      "info",
      "printidentity",
      "assert",
      "collectgarbage",
      "error",
      "getfenv",
      "getmetatable",
      "setmetatable",
      "ipairs",
      "loadfile",
      "loadstring",
      "newproxy",
      "next",
      "pairs",
      "pcall",
      "spawn",
      "rawequal",
      "rawget",
      "rawset",
      "select",
      "tonumber",
      "tostring",
      "type",
      "unpack",
      "xpcall",
      "delay",
      "stats",
      ":Remove()",
      ":BreakJoints()",
      ":GetChildren()",
      ":FindFirstChild()",
      ":FireServer()",
      ":InvokeServer()",
      ":ClearAllChildren()",
      ":Clone()",
      ":Destroy()",
      ":FindFirstAncestor()",
      ":FindFirstAncestorOfClass()",
      ":FindFirstAncestorWhichIsA()",
      ":FindFirstChildOfClass()",
      ":FindFirstChildWhichIsA()",
      ":GetDebugId()",
      ":GetDescendants()",
      ":GetFullName()",
      ":IsA()",
      ":GetPropertyChangedSignal()",
      ":IsAncestorOf()",
      ":IsDescendantOf()",
      ":WaitForChild()",
      ":Connect()",
      ":AncestryChanged()",
      ":Changed()",
      ":ChildAdded()",
      ":ChildRemoved()",
      ":DescendantAdded()",
      ":DescendantRemoving()",
      ":GetService()",
      ":GetObjects()",
      ":HttpGet()",
      ":Wait()",
    ]) {
      this.editorAddIntellisense(
        key,
        "Function",
        key,
        key.includes(":") ? key.substring(1, key.length) : key
      );
      globalWords.push(key)
    }

    for (const key of [
      "Visible",
      "Color",
      "Transparency",
      "Thickness",
      "From",
      "To",
      "Text",
      "Size",
      "Center",
      "Outline",
      "OutlineColor",
      "Position",
      "TextBounds",
      "Font",
      "Data",
      "Rounding",
      "NumSides",
      "Radius",
      "Filled",
      "PointA",
      "PointB",
      "PointC",
      "PointD",
    ]) {
      this.editorAddIntellisense(
        key,
        "Property",
        "Property for Drawing Library",
        key
      );
    }

    monaco.languages.setMonarchTokensProvider('lua', {
      tokenizer: {
        root: [
          [new RegExp(`\\b(${globalWords.join('|')})\\b`, 'g'), "global"],
          [new RegExp(`\\b(${keyWords.join('|')})\\b`, 'g'), "keyword"],
          [/"(?:\\.|[^\\"])*"|'(?:\\.|[^\\'])*'/gm, "string"],
          [/-?\b\d+(\.\d+)?(e[+-]?\d+)?\b/gi, "number"]
        ]
      }
    })

    this.editor = monaco.editor.create(this.exploitEditor, {
      language: "lua",
      theme: "dark",
      value: "test",
      fontFamily: "Fira Code",
      fontSize: 13,
      acceptSuggestionOnEnter: "smart",
      suggestOnTriggerCharacters: true,
      suggestSelection: "recentlyUsed",
      folding: true,
      autoIndent: "keep",
      scrollBeyondLastLine: true,
      wordBasedSuggestions: "currentDocument",
      scrollbar: {
        verticalHasArrows: true,
      },
      minimap: {
        enabled: false,
      },
      showFoldingControls: "always",
      smoothScrolling: true,
      contextmenu: true,
      lineNumbersMinChars: 2,
    });

    window.onresize = function () {
      EditorManager.editor?.layout();
    };


    this.editor.onDidChangeModelContent(function () {
      EditorManager.updateIntelliSense();
      //setActiveTabContent(editorGetText());
    });

    this.editor.onDidScrollChange(function (_e) {
      //setActiveTabScroll(e.scrollTop);
    });

    this.editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      function () {
        //const activeTab = tabs.find((t) => t.active === true);
        //if (activeTab) saveTabContent(activeTab);
      }
    );

    this.editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR,
      function () {
        //const activeTab = tabs.find((t) => t.active === true);
        //if (activeTab) revertTabContent(activeTab);
      }
    );

    this.editor.addCommand(monaco.KeyCode.Home, () => null);
    this.updateIntelliSense();
  }

  static getEditorText(): string {
    if (this.editor === null) return "";
    return this.editor.getValue();
  }

  static setEditorText(newText: string, preserveUndo: boolean) {
    if (this.editor === null) return;
    const model = this.editor.getModel() as monaco.editor.ITextModel;
    const range = model.getFullModelRange();

    if (preserveUndo) {
      this.editor.pushUndoStop();
      this.editor.executeEdits("", [{ range: range, text: newText }]);
    } else this.editor.setValue(newText);

    this.editor.setSelection({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: 1,
    });
  }
}
