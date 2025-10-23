describe('Навигация по разделам', () => {
  it('открывает кампании из панели', () => {
    cy.visit('/');
    cy.contains('Панель управления');
    cy.contains('Кампании').click();
    cy.url().should('include', '/campaigns');
    cy.contains('Список кампаний');
  });
});
