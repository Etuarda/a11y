export class ArtifactBuilder {
  buildUserStory(answers) {
    const persona = answers.screenReader
      ? 'usuário com deficiência visual que utiliza leitor de tela'
      : answers.keyboardOnly
        ? 'usuário que depende de navegação por teclado'
        : answers.highCognitiveLoad
          ? 'usuário com necessidade de menor carga cognitiva'
          : 'usuário com necessidades diversas de acessibilidade';

    const goalsByInterface = {
      form: 'preencher o fluxo com autonomia',
      modal: 'interagir com o diálogo sem perder o contexto',
      navigation: 'navegar entre seções com previsibilidade',
      content: 'consumir o conteúdo com clareza'
    };

    const goal = goalsByInterface[answers.interfaceType] ?? 'utilizar a interface com segurança';

    return `Como ${persona}, quero ${goal}, para completar minha tarefa sem barreiras e com previsibilidade.`;
  }

  buildBdd(answers) {
  const lines = [
    'Funcionalidade: Requisitos de acessibilidade',
    '',
    'Cenário: A interação principal permanece acessível'
  ];

  if (answers.keyboardOnly) {
    lines.push('  Dado que navego usando apenas o teclado');
    lines.push('  Quando percorro os elementos interativos com Tab e Shift+Tab');
    lines.push('  Então o indicador de foco deve estar visível e a ordem de foco deve ser lógica');
  }

  if (answers.screenReader) {
    lines.push('  Dado que utilizo leitor de tela');
    lines.push('  Quando foco em um controle interativo');
    lines.push('  Então o controle deve expor nome acessível, papel e estado/valor');
  }

  if (answers.interfaceType === 'modal') {
    lines.push('  Dado que um diálogo foi aberto');
    lines.push('  Quando pressiono Tab dentro do diálogo');
    lines.push('  Então o foco deve permanecer preso dentro do diálogo até que ele seja fechado');
    lines.push('  E ao fechar o diálogo o foco deve retornar ao elemento que o acionou');
  }

  if (answers.sensorySensitivity) {
    lines.push('  Dado que tenho sensibilidade sensorial');
    lines.push('  Quando a página é carregada');
    lines.push('  Então as animações devem respeitar prefers-reduced-motion e não devem iniciar movimentos críticos automaticamente');
  }

  if (answers.timePressure) {
    lines.push('  Dado que minha sessão possui tempo limitado');
    lines.push('  Quando o tempo estiver prestes a expirar');
    lines.push('  Então devo ser avisado com antecedência e ter uma forma de estender o tempo ou salvar meu progresso');
  }

  return lines.join('\n');
}
  }
