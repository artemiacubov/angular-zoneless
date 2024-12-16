import { Component, HostListener, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

interface CheckboxItem {
  label: string;
  open: boolean;
  subItems: string[];
  selected: string[];
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

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  showCheckboxes = false;

  checkboxItems: CheckboxItem[] = [
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
      this.checkboxItems.forEach((item) => (item.open = false));
      this.updateSelectedCount();
    }
  }

  updateSelectedCount() {
    let funnels = 0;
    let stages = 0;
    this.checkboxItems.forEach((item) => {
      if (item.selected.length > 0) {
        funnels += 1;
      }
      stages += item.selected.length;
    });
    this.selectedCount = { funnels, stages };
  }

  saveToIndexedDB() {
    if (isPlatformBrowser(this.platformId)) {
      const dbRequest = indexedDB.open('funnelsDB', 2);

      dbRequest.onupgradeneeded = (event) => {
        const db = (event.target as IDBRequest).result as IDBDatabase;
        if (!db.objectStoreNames.contains('funnels')) {
          db.createObjectStore('funnels', { keyPath: 'id' });
        }
      };

      dbRequest.onsuccess = (event) => {
        const db = (event.target as IDBRequest).result as IDBDatabase;
        const transaction = db.transaction('funnels', 'readwrite');
        const objectStore = transaction.objectStore('funnels');

        objectStore.put({ id: 'checkboxItems', data: this.checkboxItems });
        objectStore.put({ id: 'selectedCount', data: this.selectedCount });

        transaction.oncomplete = () => console.log('Данные успешно добавлены');
        transaction.onerror = (error) => console.error('Ошибка при добавлении данных:', error);
      };

      dbRequest.onerror = (event) => {
        console.error('Ошибка при открытии базы данных:', event);
      };
    }
  }

  loadFromIndexedDB() {
    if (isPlatformBrowser(this.platformId)) {
      const dbRequest = indexedDB.open('funnelsDB', 2);

      dbRequest.onsuccess = (event) => {
        const db = (event.target as IDBRequest).result as IDBDatabase;
        const transaction = db.transaction('funnels', 'readonly');
        const objectStore = transaction.objectStore('funnels');

        const getCheckboxItemsRequest = objectStore.get('checkboxItems');
        const getSelectedCountRequest = objectStore.get('selectedCount');

        getCheckboxItemsRequest.onsuccess = () => {
          if (getCheckboxItemsRequest.result) {
            this.checkboxItems = getCheckboxItemsRequest.result.data;
          }
          this.updateSelectedCount();
        };
        getSelectedCountRequest.onsuccess = () => {
          if (getSelectedCountRequest.result) {
            this.selectedCount = getSelectedCountRequest.result.data;
          }
          this.updateSelectedCount();
        };
      };

      dbRequest.onerror = (event) => {
        console.error('Ошибка при загрузке базы данных:', event);
      };
    }
  }

}
