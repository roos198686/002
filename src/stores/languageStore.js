import { ref } from 'vue'

export const langStore = {
  currentLang: ref('en'),

  setLang(lang) {
    this.currentLang.value = lang
  }
}