import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CheckboxItem {
  label: string;
  open: boolean;
  subItems: any;
  selected: any;
}
interface SelectedCount {
  funnels: number;
  stages: number;
}

@Component({
  selector: 'app-funnels',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './funnels.component.html',
  styleUrls: ['./funnels.component.css'],
})

export class FunnelsComponent implements OnInit {
  showCheckboxes = false;

  checkboxItems: any = [
    { label: 'Продажи', open: false, subItems: ['Неразобранное', 'Переговоры', 'Принимают решение', 'Успешно'], selected: [] },
    { label: 'Сотрудники', open: false, subItems: ['Неразобранное', 'Переговоры', 'Принимают решение', 'Успешно'], selected: [] },
    { label: 'Партнёры', open: false, subItems: ['Неразобранное', 'Переговоры', 'Принимают решение', 'Успешно'], selected: [] },
    { label: 'Ивент', open: false, subItems: ['Неразобранное', 'Переговоры', 'Принимают решение', 'Успешно'], selected: [] },
    { label: 'Входящие обращения', open: false, subItems: ['Неразобранное', 'Переговоры', 'Принимают решение', 'Успешно'], selected: [] },
  ];

  selectedCount: SelectedCount = { funnels: 0, stages: 0 };

  ngOnInit(): void {
    this.loadFromIndexedDB();
  }

  toggleCheckboxes() {
    this.showCheckboxes = !this.showCheckboxes;
  }

  toggleSubCheckboxes(item: CheckboxItem) {
    item.open = !item.open;
  }

  toggleSelection(item: CheckboxItem, subItem: string) {
    const index = item.selected.indexOf(subItem);
    if (index === -1) {
      item.selected.push(subItem);
    } else {
      item.selected.splice(index, 1);
    }
    this.updateSelectedCount();
    this.saveToIndexedDB();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const button = document.querySelector('.toggle-btn');
    const container = document.querySelector('.checkbox-container');
    if (!button?.contains(event.target as Node) && !container?.contains(event.target as Node)) {
      this.showCheckboxes = false;
      this.checkboxItems.forEach((item: { open: boolean; }) => item.open = false);
      this.updateSelectedCount();
    }
  }

  updateSelectedCount() {
    let funnels = 0;
    let stages = 0;
    this.checkboxItems.forEach((item: { selected: string | any[]; }) => {
      if (item.selected.length > 0) {
        funnels += 1;
      }
      stages += item.selected.length;
    });
    this.selectedCount = { funnels, stages };
  }

  saveToIndexedDB() {
    if (typeof indexedDB !== 'undefined') {
      const dbRequest = indexedDB.open('funnelsDB', 1);
      dbRequest.onsuccess = (event) => {
        const db = (event.target as any).result;
        const transaction = db.transaction(['funnels'], 'readwrite');
        const objectStore = transaction.objectStore('funnels');
        objectStore.put(this.checkboxItems, 'checkboxItems');
        objectStore.put(this.selectedCount, 'selectedCount');
      };
    }
  }

  loadFromIndexedDB() {
    if (typeof indexedDB !== 'undefined') {
      const dbRequest = indexedDB.open('funnelsDB', 1);
      dbRequest.onsuccess = (event) => {
        const db = (event.target as any).result;
        const transaction = db.transaction(['funnels'], 'readonly');
        const objectStore = transaction.objectStore('funnels');
        const getCheckboxItemsRequest = objectStore.get('checkboxItems');
        const getSelectedCountRequest = objectStore.get('selectedCount');

        getCheckboxItemsRequest.onsuccess = () => {
          if (getCheckboxItemsRequest.result) {
            this.checkboxItems = getCheckboxItemsRequest.result;
            this.updateSelectedCount();
          }
        };
        getSelectedCountRequest.onsuccess = () => {
          if (getSelectedCountRequest.result) {
            this.selectedCount = getSelectedCountRequest.result;
          }
        };
      };
    }
  }
}
