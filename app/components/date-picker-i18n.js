/**
 * Created by alex on 22/06/2015.
 */
/**
 * Created by alex on 07/04/2015.
 */
import Datepicker from 'ember-cli-datepicker/components/date-picker';

export default Datepicker.extend({
  i18nDatepicker: {
    previousMonth : 'Mois Précédent',
    nextMonth     : 'Mois Prochain',
    months        : ['Janvier','Fervrier','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Decembre'],
    weekdays      : ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
    weekdaysShort : ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']
  }
});
