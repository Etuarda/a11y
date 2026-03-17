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
      'Feature: Accessibility requirements',
      '',
      'Scenario: Core interaction remains accessible'
    ];

    if (answers.keyboardOnly) {
      lines.push('  Given I navigate using only the keyboard');
      lines.push('  When I move through interactive elements using Tab and Shift+Tab');
      lines.push('  Then the focus indicator must be visible and the focus order must be logical');
    }

    if (answers.screenReader) {
      lines.push('  Given I use a screen reader');
      lines.push('  When I focus on an interactive control');
      lines.push('  Then the control must expose an accessible name, role, and state/value');
    }

    if (answers.interfaceType === 'modal') {
      lines.push('  Given a dialog is opened');
      lines.push('  When I press Tab within the dialog');
      lines.push('  Then the focus must remain trapped inside the dialog until it is closed');
      lines.push('  And closing the dialog must return focus to the triggering element');
    }

    if (answers.sensorySensitivity) {
      lines.push('  Given I have sensory sensitivity');
      lines.push('  When the page loads');
      lines.push('  Then animations must respect prefers-reduced-motion and must not autoplay critical motion');
    }

    if (answers.timePressure) {
      lines.push('  Given my session is time-limited');
      lines.push('  When time is about to expire');
      lines.push('  Then I must be warned in advance and have a way to extend or save progress');
    }

    return lines.join('\n');
  }
}
